import { type SigninData, type User } from "../types";
import { fetchJson } from "./fetchJson";
import { dummyLoginResponseSchema, userSchema } from "./schemas";

interface AuthUser extends User {
  token: string;
}

const API_URL = `${import.meta.env.VITE_API_URL}/auth`;

const toUser = (data: User): User => ({
  id: data.id,
  username: data.username,
  email: data.email,
  firstName: data.firstName,
  lastName: data.lastName,
});

export const loginUser = async (credentials: SigninData): Promise<AuthUser> => {
  const data = await fetchJson(`${API_URL}/login`, dummyLoginResponseSchema, "Login failed", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  return { ...toUser(data), token: data.accessToken };
};

export const fetchAuthUser = async (): Promise<User> => {
  const data = await fetchJson(`${API_URL}/me`, userSchema, "Failed to fetch authenticated user");
  return toUser(data);
};
