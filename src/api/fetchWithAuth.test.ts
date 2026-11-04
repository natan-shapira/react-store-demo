import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configureAuth, fetchWithAuth } from "./fetchWithAuth";

const URL = "https://dummyjson.com/test";

const mockFetch = (status = 200) => {
  const response = new Response(null, { status });
  vi.spyOn(globalThis, "fetch").mockResolvedValue(response);
  return response;
};

const getRequestHeaders = () => vi.mocked(fetch).mock.calls[0]?.[1]?.headers as Headers;

describe("fetchWithAuth", () => {
  let token: string | null;
  const onUnauthorized = vi.fn();

  beforeEach(() => {
    token = null;
    onUnauthorized.mockReset();
    configureAuth({ getToken: () => token, onUnauthorized });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Authorization header", () => {
    it("should add the Authorization header when there is a token", async () => {
      token = "test-token";
      mockFetch();

      await fetchWithAuth(URL);

      expect(getRequestHeaders().get("Authorization")).toBe("Bearer test-token");
    });

    it("should not add the Authorization header when there is no token", async () => {
      mockFetch();

      await fetchWithAuth(URL);

      expect(getRequestHeaders().has("Authorization")).toBe(false);
    });

    it("should read the token on every request, not once at configuration", async () => {
      mockFetch();
      token = "new-token";

      await fetchWithAuth(URL);

      expect(getRequestHeaders().get("Authorization")).toBe("Bearer new-token");
    });

    it("should keep headers that were passed in the options", async () => {
      token = "test-token";
      mockFetch();

      await fetchWithAuth(URL, { headers: { "Content-Type": "application/json" } });

      expect(getRequestHeaders().get("Content-Type")).toBe("application/json");
      expect(getRequestHeaders().get("Authorization")).toBe("Bearer test-token");
    });
  });

  describe("Request and response", () => {
    it("should pass the other options (method, body) to fetch", async () => {
      mockFetch();

      await fetchWithAuth(URL, { method: "POST", body: '{"a":1}' });

      expect(fetch).toHaveBeenCalledWith(
        URL,
        expect.objectContaining({ method: "POST", body: '{"a":1}' })
      );
    });

    it("should return the response as is", async () => {
      const response = mockFetch(201);

      await expect(fetchWithAuth(URL)).resolves.toBe(response);
    });
  });

  describe("Unauthorized responses", () => {
    it("should call onUnauthorized when the response status is 401", async () => {
      mockFetch(401);

      await fetchWithAuth(URL);

      expect(onUnauthorized).toHaveBeenCalledTimes(1);
    });

    it.each([200, 400, 403, 404, 500])(
      "should not call onUnauthorized on status %i",
      async (status) => {
        mockFetch(status);

        await fetchWithAuth(URL);

        expect(onUnauthorized).not.toHaveBeenCalled();
      }
    );
  });

  describe("Without configuration", () => {
    it("should send requests without a token and ignore 401 until configureAuth is called", async () => {
      // A fresh module copy has the default, unconfigured dependencies
      vi.resetModules();
      const { fetchWithAuth: unconfiguredFetch } = await import("./fetchWithAuth");
      mockFetch(401);

      await expect(unconfiguredFetch(URL)).resolves.toBeInstanceOf(Response);
      expect(getRequestHeaders().has("Authorization")).toBe(false);
      expect(onUnauthorized).not.toHaveBeenCalled();
    });
  });
});
