import { type SigninData, type User, } from "../types";
import { ApiError } from "./ApiError";
import { fetchWithAuth } from "./fetchWithAuth";

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
    const response = await fetchWithAuth(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
    });
    const data = await response.json();

    if (!response.ok) {
        throw new ApiError(data.message || "Login failed", response.status);
    }

    return { ...toUser(data), token: data.accessToken };
};

export const fetchAuthUser = async (): Promise<User> => {
    const response = await fetchWithAuth(`${API_URL}/me`);

    if (!response.ok) {
        throw new ApiError("Failed to fetch authenticated user", response.status);
    }

    return toUser(await response.json());
};
