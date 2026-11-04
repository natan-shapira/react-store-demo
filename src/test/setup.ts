import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterEach } from "vitest";

// Pages are lazy loaded; under a busy parallel run (e.g. with coverage) the first load of a page chunk
// can take longer than the 1s default, which made findBy* queries flaky
configure({ asyncUtilTimeout: 3000 });

afterEach(async () => {
  // Unmount everything rendered by React Testing Library
  cleanup();

  // The persisted stores write to localStorage, so it is cleared between tests
  localStorage.clear();

  // Imported lazily: a static import here would load the stores (and the API modules behind them)
  // before each test file registers its vi.mock calls, so those mocks would silently not apply
  const { useAuthStore } = await import("../stores/useAuthStore");
  const { useCartStore } = await import("../stores/useCartStore");

  // Reset the Zustand stores to their initial state
  useAuthStore.setState({ token: null, user: null, error: null, isLoading: false });
  useCartStore.getState().clearCart();
});
