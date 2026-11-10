import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchAuthUser, loginUser } from "./auth";
import { fetchWithAuth } from "./fetchWithAuth";
import { jsonResponse } from "../test/factories";

vi.mock("./fetchWithAuth", () => ({ fetchWithAuth: vi.fn() }));

const BASE_URL = "https://dummyjson.com/auth";

const publicUser = {
  id: 1,
  username: "emilys",
  email: "emily.johnson@x.dummyjson.com",
  firstName: "Emily",
  lastName: "Johnson",
};

// Fields DummyJSON returns that must not reach the app
const sensitiveFields = {
  password: "emilyspass",
  ssn: "900-590-289",
  bank: { cardNumber: "3693233511855044" },
  image: "https://dummyjson.com/icon/emilys/128",
};

const respondWith = (body: unknown, status = 200) =>
  vi.mocked(fetchWithAuth).mockImplementation(() => Promise.resolve(jsonResponse(body, status)));

describe("auth API", () => {
  beforeEach(() => {
    vi.mocked(fetchWithAuth).mockReset();
  });

  describe("loginUser", () => {
    const credentials = { username: "emilys", password: "emilyspass" };

    it("should POST the credentials as JSON to /auth/login", async () => {
      respondWith({ ...publicUser, accessToken: "token" });

      await loginUser(credentials);

      expect(fetchWithAuth).toHaveBeenCalledWith(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
    });

    it("should map accessToken to token", async () => {
      respondWith({ ...publicUser, accessToken: "access-123", refreshToken: "refresh-456" });

      const user = await loginUser(credentials);

      expect(user.token).toBe("access-123");
    });

    it("should return only the public user fields (no password or sensitive data)", async () => {
      respondWith({ ...publicUser, ...sensitiveFields, accessToken: "access-123" });

      const user = await loginUser(credentials);

      expect(user).toEqual({ ...publicUser, token: "access-123" });
    });

    it("should throw the server message when the request fails", async () => {
      respondWith({ message: "Invalid credentials" }, 400);

      await expect(loginUser(credentials)).rejects.toThrow("Invalid credentials");
    });

    it("should throw a default message when the server sends no message", async () => {
      respondWith({}, 500);

      await expect(loginUser(credentials)).rejects.toThrow("Login failed");
    });

    it("should reject a successful response without an access token", async () => {
      respondWith(publicUser);

      await expect(loginUser(credentials)).rejects.toThrow("Login failed");
    });
  });

  describe("fetchAuthUser", () => {
    it("should request /auth/me with the auth token", async () => {
      respondWith(publicUser);

      await fetchAuthUser();

      expect(fetchWithAuth).toHaveBeenCalledWith(`${BASE_URL}/me`, undefined);
    });

    it("should return only the public user fields", async () => {
      respondWith({ ...publicUser, ...sensitiveFields });

      await expect(fetchAuthUser()).resolves.toEqual(publicUser);
    });

    it("should return the role the server gives the user", async () => {
      respondWith({ ...publicUser, role: "admin" });

      await expect(fetchAuthUser()).resolves.toEqual({ ...publicUser, role: "admin" });
    });

    it("should treat a role the app does not know as no role", async () => {
      respondWith({ ...publicUser, role: "superadmin" });

      const user = await fetchAuthUser();

      expect(user.role).toBeUndefined();
    });

    it("should throw the server message when the request fails", async () => {
      respondWith({ message: "Token Expired!" }, 401);

      await expect(fetchAuthUser()).rejects.toThrow("Token Expired!");
    });

    it("should throw a default message when the server sends no message", async () => {
      respondWith({}, 401);

      await expect(fetchAuthUser()).rejects.toThrow("Failed to fetch authenticated user");
    });

    it("should reject a successful response that is missing user fields", async () => {
      respondWith({ id: 1, username: "emilys" });

      await expect(fetchAuthUser()).rejects.toThrow("Failed to fetch authenticated user");
    });
  });
});
