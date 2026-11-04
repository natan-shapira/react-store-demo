import { describe, expect, it } from "vitest";
import { getErrorMessage } from "./errors";
import { ApiError } from "../api/ApiError";

describe("getErrorMessage", () => {
  describe("Error instances", () => {
    it("should return the message of an Error", () => {
      expect(getErrorMessage(new Error("Network down"))).toBe("Network down");
    });

    it("should return the message of an Error subclass", () => {
      expect(getErrorMessage(new ApiError("Product not found", 404))).toBe("Product not found");
    });

    it("should use the fallback when the Error has an empty message", () => {
      expect(getErrorMessage(new Error(""), "Login failed")).toBe("Login failed");
    });
  });

  describe("Other thrown values", () => {
    it("should return a thrown string as is", () => {
      expect(getErrorMessage("Something broke")).toBe("Something broke");
    });

    it("should use the fallback for an empty string", () => {
      expect(getErrorMessage("", "Login failed")).toBe("Login failed");
    });

    it("should read the message of a plain object", () => {
      expect(getErrorMessage({ message: "Invalid credentials" })).toBe("Invalid credentials");
    });

    it("should ignore a message that is not a string", () => {
      expect(getErrorMessage({ message: 42 }, "Login failed")).toBe("Login failed");
    });

    it.each([
      { value: null, description: "null" },
      { value: undefined, description: "undefined" },
      { value: 42, description: "a number" },
      { value: {}, description: "an object without a message" },
    ])("should use the fallback for $description", ({ value }) => {
      expect(getErrorMessage(value, "Login failed")).toBe("Login failed");
    });
  });

  it("should use a generic message when no fallback is given", () => {
    expect(getErrorMessage(null)).toBe("An unknown error occurred");
  });
});
