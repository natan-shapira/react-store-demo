import { describe, expect, it } from "vitest";
import { isRetryableError, shouldRetry } from "./shouldRetry";
import { ApiError, NETWORK_ERROR_STATUS } from "./ApiError";

const networkError = new ApiError("Could not reach the server", NETWORK_ERROR_STATUS);

describe("isRetryableError", () => {
  it.each([
    ["a network error", networkError, true],
    ["a 5xx error", new ApiError("Server error", 503), true],
    ["an error that is not an ApiError", new TypeError("Failed to fetch"), true],
    ["a 4xx error", new ApiError("Not found", 404), false],
    ["an invalid response body", new ApiError("Failed to load products", 200), false],
  ])("should return %s → %s", (_, error, expected) => {
    expect(isRetryableError(error)).toBe(expected);
  });
});

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
    expect(shouldRetry(0, networkError)).toBe(true);
    expect(shouldRetry(1, networkError)).toBe(true);
    expect(shouldRetry(2, networkError)).toBe(false);
  });
});
