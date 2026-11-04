import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SigninData, SignupData, User } from "../types";
import { fetchAuthUser, loginUser } from "../api/auth";
import { useCartStore } from "./useCartStore";
import { getErrorMessage } from "../utils/errors";

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
  persist(
    (set, get) => ({
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
          set({ error: getErrorMessage(error, "Login failed"), isLoading: false });
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
          set({ error: getErrorMessage(error, "Signup failed"), isLoading: false });
          return false;
        }
      },
      updateUser: (id, image) => {
        set((state) => (state.user?.id === id ? { user: { ...state.user, image } } : state));
      },
      checkAuth: async () => {
        const currentToken = get().token;
        if (!currentToken) return;
        set({ isLoading: true });
        try {
          const user = await fetchAuthUser();
          if (get().token !== currentToken) {
            return;
          }
          set((state) => ({
            user: state.user?.id === user.id ? { ...user, image: state.user.image } : user,
            isLoading: false,
          }));
        } catch (error) {
          // A 401 has already logged out through fetchWithAuth, so only non-auth failures get here
          if (get().token !== currentToken) return;
          set({
            isLoading: false,
            error: getErrorMessage(error, "Failed to check authentication"),
          });
        }
      },
      logout: () => {
        useCartStore.getState().clearCart();
        // Also ends a pending checkAuth, which skips its own reset once the session has changed
        set({ token: null, user: null, error: null, isLoading: false });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
