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

// DummyJSON has no real sign up endpoint (see "Known limitations" in the README),
// so signup imitates a request with a short delay, which also shows the loading state
const SIGNUP_DELAY_MS = 2000;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoading: false,
      error: null,
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { token, ...user } = await loginUser(credentials);
          set({ token, user, isLoading: false });
          return true;
        } catch (error) {
          set({ error: getErrorMessage(error, "Login failed"), isLoading: false });
          return false;
        }
      },
      // Unlike login there is no try/catch: no request is sent, so nothing can fail.
      // The user gets no token, because there is no real account to authenticate with
      signup: async (data) => {
        set({ isLoading: true, error: null });
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
        // isLoading is reset here because a checkAuth may still be waiting for the server;
        // when it finishes, it sees that the token changed and leaves this new state alone
        set({ token: null, user: null, error: null, isLoading: false });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      version: 1,
      partialize: (state) => ({ token: state.token, user: state.user }),
      // version and migrate let a future change to the saved shape convert old data when it loads.
      // Data saved before versioning (version 0) already has the current shape, so it is kept as is
      migrate: (persistedState) => persistedState as Pick<AuthState, "token" | "user">,
    }
  )
);
