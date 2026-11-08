import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { fetchJson } from "./fetchJson";
import { fetchWithAuth } from "./fetchWithAuth";
import { ApiError, NETWORK_ERROR_STATUS } from "./ApiError";

vi.mock("./fetchWithAuth", () => ({ fetchWithAuth: vi.fn() }));

const URL = "https://dummyjson.com/test";

const productSchema = z.object({ id: z.number(), title: z.string() });
const anySchema = z.unknown();

const respondWith = (body: string, status = 200) =>
  vi
    .mocked(fetchWithAuth)
    .mockImplementation(() => Promise.resolve(new Response(body, { status })));

const getError = async (promise: Promise<unknown>) => {
  try {
    await promise;
  } catch (error) {
    return error as ApiError;
  }
  throw new Error("Expected the request to fail");
};

describe("fetchJson", () => {
  beforeEach(() => {
    vi.mocked(fetchWithAuth).mockReset();
  });

  describe("Successful responses", () => {
    it("should return the parsed JSON body", async () => {
      respondWith(JSON.stringify({ id: 1, title: "Product" }));

      await expect(fetchJson(URL, productSchema, "Failed")).resolves.toEqual({
        id: 1,
        title: "Product",
      });
    });

    it("should strip fields that are not in the schema", async () => {
      respondWith(JSON.stringify({ id: 1, title: "Product", password: "secret" }));

      await expect(fetchJson(URL, productSchema, "Failed")).resolves.toEqual({
        id: 1,
        title: "Product",
      });
    });

    it("should pass the URL and options to fetchWithAuth", async () => {
      respondWith("{}");
      const options = { method: "POST", body: '{"a":1}' };

      await fetchJson(URL, anySchema, "Failed", options);

      expect(fetchWithAuth).toHaveBeenCalledWith(URL, options);
    });

    it("should pass undefined options for a plain GET request", async () => {
      respondWith("{}");

      await fetchJson(URL, anySchema, "Failed");

      expect(fetchWithAuth).toHaveBeenCalledWith(URL, undefined);
    });
  });

  describe("Failed responses", () => {
    it("should throw an ApiError with the server message and status", async () => {
      respondWith(JSON.stringify({ message: "Product not found" }), 404);

      const error = await getError(fetchJson(URL, anySchema, "Failed to load product"));

      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe("Product not found");
      expect(error.status).toBe(404);
    });

    it("should use the default message when the server sends no message", async () => {
      respondWith("{}", 500);

      const error = await getError(fetchJson(URL, anySchema, "Failed to load product"));

      expect(error.message).toBe("Failed to load product");
      expect(error.status).toBe(500);
    });

    it("should use the default message when the error body is not JSON", async () => {
      respondWith("<html>Bad Gateway</html>", 502);

      const error = await getError(fetchJson(URL, anySchema, "Failed to load product"));

      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe("Failed to load product");
      expect(error.status).toBe(502);
    });

    it("should throw when a successful response is not JSON", async () => {
      respondWith("not json", 200);

      const error = await getError(fetchJson(URL, anySchema, "Failed to load product"));

      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe("Failed to load product");
    });

    it("should not validate the body of an error response", async () => {
      respondWith(JSON.stringify({ message: "Product not found" }), 404);

      const error = await getError(fetchJson(URL, productSchema, "Failed to load product"));

      expect(error.message).toBe("Product not found");
      expect(error.cause).toBeUndefined();
    });
  });

  describe("Network failures", () => {
    const networkError = new TypeError("Failed to fetch");

    it("should turn a failed request into an ApiError with a readable message", async () => {
      vi.mocked(fetchWithAuth).mockRejectedValue(networkError);

      const error = await getError(fetchJson(URL, anySchema, "Failed to load product"));

      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe(
        "Could not reach the server. Check your connection and try again."
      );
      expect(error.status).toBe(NETWORK_ERROR_STATUS);
    });

    it("should keep the original error as the cause", async () => {
      vi.mocked(fetchWithAuth).mockRejectedValue(networkError);

      const error = await getError(fetchJson(URL, anySchema, "Failed to load product"));

      expect(error.cause).toBe(networkError);
    });

    it("should rethrow a cancelled request unchanged", async () => {
      const abortError = new DOMException("The operation was aborted.", "AbortError");
      vi.mocked(fetchWithAuth).mockRejectedValue(abortError);

      await expect(fetchJson(URL, anySchema, "Failed to load product")).rejects.toBe(abortError);
    });
  });

  describe("Invalid response shape", () => {
    it("should throw an ApiError with the default message and status", async () => {
      respondWith(JSON.stringify({ id: "1", title: "Product" }));

      const error = await getError(fetchJson(URL, productSchema, "Failed to load product"));

      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe("Failed to load product");
      expect(error.status).toBe(200);
    });

    it("should attach the validation issues as the cause", async () => {
      respondWith(JSON.stringify({ id: 1 }));

      const error = await getError(fetchJson(URL, productSchema, "Failed to load product"));

      expect(error.cause).toBeInstanceOf(z.ZodError);
      expect((error.cause as z.ZodError).issues).toEqual([
        expect.objectContaining({ path: ["title"] }),
      ]);
    });
  });
});
