import { describe, expect, it } from "vitest";
import { shouldRetry } from "./shouldRetry";
import { ApiError } from "./ApiError";

describe("shouldRetry", () => {
  it.each([400, 401, 404])("should not retry a %i client error", (status) => {
    expect(shouldRetry(0, new ApiError("Client error", status))).toBe(false);
  });

  it("should not retry a successful response with an invalid body", () => {
    expect(shouldRetry(0, new ApiError("Failed to load products", 200))).toBe(false);
  });

  it("should retry a server error up to two times", () => {
    const error = new ApiError("Server error", 500);

    expect(shouldRetry(0, error)).toBe(true);
    expect(shouldRetry(1, error)).toBe(true);
    expect(shouldRetry(2, error)).toBe(false);
  });

  it("should retry a network error up to two times", () => {
    const error = new TypeError("Failed to fetch");

    expect(shouldRetry(0, error)).toBe(true);
    expect(shouldRetry(1, error)).toBe(true);
    expect(shouldRetry(2, error)).toBe(false);
  });
});
