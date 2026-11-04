import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProductPage from "./ProductPage";
import { useProduct } from "../../api/products";
import { useCartStore } from "../../stores/useCartStore";
import type { Product } from "../../types";
import { getAddToCartButton, getQuantity } from "../../test/queries";

vi.mock("../../api/products", () => ({ useProduct: vi.fn() }));

const product: Product = {
  id: 5,
  title: "Wireless Headphones",
  price: 20,
  description: "Noise cancelling headphones",
  category: "electronics",
  image: "headphones.jpg",
};

const mockQuery = (overrides: Record<string, unknown> = {}) =>
  vi.mocked(useProduct).mockReturnValue({
    data: product,
    isLoading: false,
    error: null,
    ...overrides,
  } as unknown as ReturnType<typeof useProduct>);

// The product page is opened from the cart by default; pass ["/products/5"] for a direct visit
const renderPage = (entries = ["/cart", "/products/5"]) => {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={entries} initialIndex={entries.length - 1}>
      <Routes>
        <Route path="/" element={<h1>Catalog Page</h1>} />
        <Route path="/cart" element={<h1>Cart Page</h1>} />
        <Route path="/products/:id" element={<ProductPage />} />
      </Routes>
    </MemoryRouter>
  );
  return { user };
};

describe("ProductPage", () => {
  beforeEach(() => {
    useCartStore.setState({ items: {} });
    mockQuery();
  });

  describe("Loading and errors", () => {
    it("should show a loading message while loading", () => {
      mockQuery({ isLoading: true, data: undefined });
      renderPage();

      expect(screen.getByText("Loading product details...")).toBeInTheDocument();
    });

    it("should show an error message when the product cannot be loaded", () => {
      mockQuery({ data: undefined, error: new Error("Product with id '5' not found") });
      renderPage();

      expect(
        screen.getByText("Failed to load data, or the product doesn't exist.")
      ).toBeInTheDocument();
    });

    it('should return to the previous page when "Go back" is clicked on the error screen', async () => {
      mockQuery({ data: undefined, error: new Error("Not found") });
      const { user } = renderPage();

      await user.click(screen.getByRole("button", { name: "Go back" }));

      expect(screen.getByRole("heading", { name: "Cart Page" })).toBeInTheDocument();
    });

    it('should go to the catalog when "Go back" is clicked after a direct visit', async () => {
      mockQuery({ data: undefined, error: new Error("Not found") });
      const { user } = renderPage(["/products/5"]);

      await user.click(screen.getByRole("button", { name: "Go back" }));

      expect(screen.getByRole("heading", { name: "Catalog Page" })).toBeInTheDocument();
    });
  });

  describe("Display", () => {
    it("should request the product by the id in the URL", () => {
      renderPage();

      expect(useProduct).toHaveBeenCalledWith("5");
    });

    it("should show the image, title, price, category and description", () => {
      renderPage();

      expect(screen.getByRole("img", { name: "Wireless Headphones" })).toHaveAttribute(
        "src",
        "headphones.jpg"
      );
      expect(
        screen.getByRole("heading", { level: 1, name: "Wireless Headphones" })
      ).toBeInTheDocument();
      expect(screen.getByText("$20.00")).toBeInTheDocument();
      expect(screen.getByText("electronics")).toBeInTheDocument();
      expect(screen.getByText("Noise cancelling headphones")).toBeInTheDocument();
    });

    it('should return to the previous page when "Back to catalog" is clicked', async () => {
      const { user } = renderPage();

      await user.click(screen.getByRole("button", { name: "Back to catalog" }));

      expect(screen.getByRole("heading", { name: "Cart Page" })).toBeInTheDocument();
    });

    it('should go to the catalog when "Back to catalog" is clicked after a direct visit', async () => {
      const { user } = renderPage(["/products/5"]);

      await user.click(screen.getByRole("button", { name: "Back to catalog" }));

      expect(screen.getByRole("heading", { name: "Catalog Page" })).toBeInTheDocument();
    });
  });

  describe("Quantity selector", () => {
    it("should start at 1", () => {
      renderPage();

      expect(getQuantity()).toBe(1);
    });

    it("should increase and decrease the quantity", async () => {
      const { user } = renderPage();

      await user.click(screen.getByLabelText("Increase quantity"));
      await user.click(screen.getByLabelText("Increase quantity"));
      expect(getQuantity()).toBe(3);

      await user.click(screen.getByLabelText("Decrease quantity"));
      expect(getQuantity()).toBe(2);
    });

    it("should not go below 1", async () => {
      const { user } = renderPage();

      await user.click(screen.getByLabelText("Decrease quantity"));

      expect(getQuantity()).toBe(1);
    });

    it("should show the total (price × quantity) on the add button", async () => {
      const { user } = renderPage();
      expect(getAddToCartButton()).toHaveTextContent("$20.00");

      await user.click(screen.getByLabelText("Increase quantity"));
      await user.click(screen.getByLabelText("Increase quantity"));

      expect(getAddToCartButton()).toHaveTextContent("$60.00");
    });
  });

  describe("Add to cart", () => {
    it("should add the product with the selected quantity", async () => {
      const { user } = renderPage();

      await user.click(screen.getByLabelText("Increase quantity"));
      await user.click(getAddToCartButton());

      expect(useCartStore.getState().items[5]).toEqual({ ...product, quantity: 2 });
    });

    it("should show the quantity already in the cart", () => {
      useCartStore.setState({ items: { 5: { ...product, quantity: 3 } } });
      renderPage();

      expect(screen.getByText("This product is already in your cart")).toBeInTheDocument();
      expect(screen.getByText("3 in cart")).toBeInTheDocument();
    });

    it('should show "Add more to cart" when the product is already in the cart', () => {
      useCartStore.setState({ items: { 5: { ...product, quantity: 3 } } });
      renderPage();

      expect(getAddToCartButton()).toHaveTextContent("Add more to cart");
    });
  });
});
