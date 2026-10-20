import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SigninData, SignupData, User } from "../types";
import { fetchAuthUser, loginUser } from "../api/auth";
import { useCartStore } from "./useCartStore";

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (data: SigninData) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  updateUser: (id: number, image: string) => void;
  logout: () => void;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

// DummyJSON has no real signup endpoint, so signup is simulated with a delay
const SIGNUP_DELAY_MS = 2000;

export const useAuthStore = create<AuthState>()(
    persist((set, get) => ({
        token: null,
        user: null,
        isLoading: false,
        error: null,
        login: async ({ username, password }) => {
            set({ isLoading: true, error: null });
            try {
                const data = await loginUser({ username, password });
                set({
                    token: data.token,
                    user: {
                    id: data.id,
                    username: data.username,
                    email: data.email,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    },
                    isLoading: false,
                });
                return true;
            } catch (error) {
                set({ error: (error as Error).message || "Login failed", isLoading: false });
                return false;
            }
        },
        signup: async (data) => {
            set({ isLoading: true, error: null });
            try {
                await new Promise((resolve) => setTimeout(resolve, SIGNUP_DELAY_MS));
                set({
                    token: null,
                    user: {
                    id: Date.now(),
                    username: data.username,
                    email: data.email,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    },
                    isLoading: false,
                });
                return true;
            } catch (error) {
                set({ error: (error as Error).message || "Signup failed", isLoading: false });
                return false;
            }
        },
        updateUser: (id, image) => {
            set((state) => (state.user?.id === id ? { user: { ...state.user, image } } : state));
        },
        checkAuth: async () => {
            if (!get().token) return;
            set({ isLoading: true });
            try{
                const user = await fetchAuthUser();
                set((state) => ({
                    user: state.user?.id === user.id ? { ...user, image: state.user.image } : user,
                    isLoading: false,
                }));
            } catch (error) {
                get().logout();
                set({isLoading: false, error: (error as Error).message || "Failed to check authentication" });
            }
        },
        logout: () => {
            useCartStore.getState().clearCart();
            set({ token: null, user: null, error: null });
        },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ token: state.token, user: state.user }),
    })
)
