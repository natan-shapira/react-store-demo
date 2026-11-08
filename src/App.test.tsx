import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { useCategories, useProduct, useProductsList } from "./api/products";
import { useAuthStore } from "./stores/useAuthStore";
import { useCartStore } from "./stores/useCartStore";
import type { CartItem, Product } from "./types";

vi.mock("./api/products", () => ({
  PRODUCTS_PER_PAGE: 15,
  useCategories: vi.fn(),
  useProductsList: vi.fn(),
  useProduct: vi.fn(),
}));

const product: Product = {
  id: 5,
  title: "Wireless Headphones",
  price: 20,
  description: "Noise cancelling headphones",
  category: "electronics",
  image: "headphones.jpg",
};

const cartItem: CartItem = { ...product, quantity: 1 };

// App renders its own BrowserRouter, so the start page is set through the real history
const renderAt = (path: string, state?: unknown) => {
  window.history.replaceState(state ? { usr: state, key: "test", idx: 0 } : null, "", path);
  render(<App />);
};

const logIn = () =>
  useAuthStore.setState({
    token: "test-token",
    user: { id: 1, username: "emilys", email: "e@x.com", firstName: "Emily", lastName: "Johnson" },
  });

describe("App", () => {
  const checkAuth = vi.fn();

  beforeEach(() => {
    checkAuth.mockReset();
    useAuthStore.setState({ token: null, user: null, isLoading: false, error: null, checkAuth });
    useCartStore.setState({ items: {} });

    vi.mocked(useCategories).mockReturnValue({ data: [] } as unknown as ReturnType<
      typeof useCategories
    >);
    vi.mocked(useProductsList).mockReturnValue({
      data: { products: [product], total: 1 },
      isLoading: false,
      isPlaceholderData: false,
      error: null,
    } as unknown as ReturnType<typeof useProductsList>);
    vi.mocked(useProduct).mockReturnValue({
      data: product,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useProduct>);
  });

  // Pages are lazy loaded, so each test waits for the page with findBy* before asserting
  describe("Routing", () => {
    it("should show the auth page at /auth", async () => {
      renderAt("/auth");

      expect(await screen.findByRole("heading", { name: "Welcome Back" })).toBeInTheDocument();
    });

    it.each(["/", "/products/5", "/cart", "/checkout"])(
      "should redirect a guest from %s to /auth",
      async (path) => {
        renderAt(path);

        expect(await screen.findByRole("heading", { name: "Welcome Back" })).toBeInTheDocument();
        expect(window.location.pathname).toBe("/auth");
      }
    );

    it("should show the home page at / for a logged in user", async () => {
      logIn();
      renderAt("/");

      expect(await screen.findByRole("button", { name: "All" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Wireless Headphones" })).toBeInTheDocument();
    });

    it("should show the product page at /products/:id", async () => {
      logIn();
      renderAt("/products/5");

      expect(
        await screen.findByRole("heading", { level: 1, name: "Wireless Headphones" })
      ).toBeInTheDocument();
      expect(useProduct).toHaveBeenCalledWith("5");
    });

    it("should show the cart page at /cart", async () => {
      logIn();
      renderAt("/cart");

      expect(
        await screen.findByRole("heading", { name: "Your cart is empty" })
      ).toBeInTheDocument();
    });

    it("should show the checkout page at /checkout", async () => {
      logIn();
      useCartStore.setState({ items: { 5: cartItem } });
      renderAt("/checkout", { selectedItemIds: [5] });

      expect(await screen.findByRole("heading", { name: "Checkout" })).toBeInTheDocument();
    });

    it("should send /checkout without a selection to the cart and explain why", async () => {
      logIn();
      useCartStore.setState({ items: { 5: cartItem } });
      renderAt("/checkout");

      const dialog = await screen.findByRole("dialog", { name: "No items selected" });
      expect(dialog).toHaveAccessibleDescription(/Select at least one item in your cart/);
      expect(window.location.pathname).toBe("/cart");
      // The cart page focuses its heading on mount, which must not pull focus out of the open dialog
      await waitFor(() => expect(dialog).toHaveFocus());
    });

    it.each(["/auth", "/", "/cart"])("should render the navbar on %s", (path) => {
      logIn();
      renderAt(path);

      expect(screen.getByRole("link", { name: "ReactShop" })).toBeInTheDocument();
    });

    it("should show the not found page for an unknown path", async () => {
      logIn();
      renderAt("/does-not-exist");

      expect(await screen.findByRole("heading", { name: "Page not found" })).toBeInTheDocument();
      expect(screen.getByText("/does-not-exist")).toBeInTheDocument();
      expect(window.location.pathname).toBe("/does-not-exist");
    });

    it("should show the not found page to a guest without redirecting to /auth", async () => {
      renderAt("/does-not-exist");

      expect(await screen.findByRole("heading", { name: "Page not found" })).toBeInTheDocument();
      expect(screen.queryByRole("heading", { name: "Welcome Back" })).not.toBeInTheDocument();
      expect(window.location.pathname).toBe("/does-not-exist");
    });

    it("should show the not found page for an unknown nested path (e.g. /products/5/extra)", async () => {
      logIn();
      renderAt("/products/5/extra");

      expect(await screen.findByRole("heading", { name: "Page not found" })).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: "Wireless Headphones" })
      ).not.toBeInTheDocument();
    });
  });

  describe("Code splitting", () => {
    it("should show the page skeleton while the page code is loading", async () => {
      // React.lazy caches a loaded page, so a fresh App module is needed to see the loading state
      vi.resetModules();
      const { default: FreshApp } = await import("./App");
      window.history.replaceState(null, "", "/auth");

      render(<FreshApp />);

      expect(screen.getByRole("status", { name: "Loading sign in" })).toBeInTheDocument();
      expect(await screen.findByRole("heading", { name: "Welcome Back" })).toBeInTheDocument();
      expect(screen.queryByRole("status", { name: "Loading sign in" })).not.toBeInTheDocument();
    });
  });

  describe("Error handling", () => {
    afterEach(() => {
      vi.mocked(console.error).mockRestore?.();
    });

    const crashProductPage = () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(useProduct).mockImplementation(() => {
        throw new Error("Product page crashed");
      });
    };

    it("should show the error fallback when a page crashes, keeping the navbar", async () => {
      crashProductPage();
      logIn();
      renderAt("/products/5");

      expect(
        await screen.findByRole("heading", { name: "Something went wrong" })
      ).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "ReactShop" })).toBeInTheDocument();
    });

    it("should clear the error when the user navigates to another page", async () => {
      crashProductPage();
      logIn();
      renderAt("/products/5");
      const user = userEvent.setup();
      await screen.findByRole("heading", { name: "Something went wrong" });

      await user.click(screen.getByRole("link", { name: "Home" }));

      expect(await screen.findByRole("button", { name: "All" })).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: "Something went wrong" })
      ).not.toBeInTheDocument();
    });
  });

  // App always asks the store to verify the session; the store itself skips the request without a token
  describe("Authentication check", () => {
    it("should call checkAuth once on startup when there is a token", () => {
      logIn();
      renderAt("/");

      expect(checkAuth).toHaveBeenCalledTimes(1);
    });

    it("should call checkAuth once on startup when there is no token", () => {
      renderAt("/auth");

      expect(checkAuth).toHaveBeenCalledTimes(1);
    });

    it("should not call checkAuth again when the token changes after login", () => {
      renderAt("/auth");

      act(() => {
        logIn();
      });

      expect(checkAuth).toHaveBeenCalledTimes(1);
    });
  });
});
