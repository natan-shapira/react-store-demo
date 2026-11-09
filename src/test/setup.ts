import "@testing-library/jest-dom/vitest";
import { configure } from "@testing-library/react";
import { afterEach } from "vitest";

// Pages are lazy loaded, and when many test files run in parallel (e.g. with coverage) the first load
// of a page chunk can take longer than Testing Library's 1s default, so findBy* queries wait up to 3s
configure({ asyncUtilTimeout: 3000 });

// Testing Library unmounts rendered trees after each test on its own, because Vitest globals are enabled
afterEach(async () => {
  // The persisted stores write to localStorage, so it is cleared between tests
  localStorage.clear();

  // Imported lazily: a static import here would load the stores (and the API modules behind them)
  // before each test file registers its vi.mock calls, so those mocks would silently not apply
  const { useAuthStore } = await import("../stores/useAuthStore");
  const { useCartStore } = await import("../stores/useCartStore");
  useAuthStore.setState({ token: null, user: null, error: null, isLoading: false });
  useCartStore.getState().clearCart();
});
