import type { SigninData, User } from "../types";
import { fetchWithAuth } from "./fetchWithAuth";

interface AuthUser extends User {
    token: string;
}

const BASE_URL = "https://dummyjson.com/auth";

const toUser = (data: User): User => ({
    id: data.id,
    username: data.username,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
});

export const loginUser = async (credentials: SigninData): Promise<AuthUser> => {
    const response = await fetchWithAuth(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
    });
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Login failed");
    }

    return { ...toUser(data), token: data.accessToken };
};

export const fetchAuthUser = async (): Promise<User> => {
    const response = await fetchWithAuth(`${BASE_URL}/me`);

    if (!response.ok) {
        throw new Error("Failed to fetch authenticated user");
    }

    return toUser(await response.json());
};
