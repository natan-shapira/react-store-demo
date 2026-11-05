import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, expect, beforeEach } from "vitest";
import CheckoutPage from "./CheckoutPage";
import { useCartStore } from "../../stores/useCartStore";
import { useModalStore } from "../../stores/useModalStore";
import { NO_ITEMS_MODAL_TITLE } from "../../modals/NoItemsModalContent/NoItemsModalContent";
import { createCartItem } from "../../test/factories";
import { formatPrice } from "../../utils/formatters";

const headphones = createCartItem(1, 2, { title: "Wireless Headphones", price: 99.99 });
const mug = createCartItem(2, 1, { title: "Coffee Mug", price: 12.5 });

const renderCheckout = (state?: unknown) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: "/checkout", state }]}>
      <Routes>
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/cart" element={<div data-testid="cart-page">Cart Page</div>} />
      </Routes>
    </MemoryRouter>
  );

const getModalTitle = () => useModalStore.getState().title;

describe("CheckoutPage", () => {
  beforeEach(() => {
    useCartStore.setState({ items: { 1: headphones, 2: mug } });
    useModalStore.getState().closeModal();
  });

  describe("Redirects", () => {
    it("should redirect to /cart when no items are selected", () => {
      renderCheckout();

      expect(screen.getByTestId("cart-page")).toBeInTheDocument();
    });

    it("should explain the redirect in a modal", () => {
      renderCheckout();

      expect(getModalTitle()).toBe(NO_ITEMS_MODAL_TITLE);
    });

    it("should redirect to /cart when the selected ids are not valid", () => {
      renderCheckout({ selectedItemIds: ["1", 2.5] });

      expect(screen.getByTestId("cart-page")).toBeInTheDocument();
    });

    it("should redirect to /cart when the selected items are no longer in the cart", () => {
      renderCheckout({ selectedItemIds: [99] });

      expect(screen.getByTestId("cart-page")).toBeInTheDocument();
    });
  });

  describe("Order preview", () => {
    it("should display the selected items with their quantity", () => {
      renderCheckout({ selectedItemIds: [1] });

      expect(screen.getByText("Wireless Headphones")).toBeInTheDocument();
      expect(screen.getByText("× 2")).toBeInTheDocument();
    });

    it("should not display items that were not selected", () => {
      renderCheckout({ selectedItemIds: [1] });

      expect(screen.queryByText("Coffee Mug")).not.toBeInTheDocument();
    });

    it("should not open the no-items modal", () => {
      renderCheckout({ selectedItemIds: [1] });

      expect(getModalTitle()).toBe("");
    });

    it("should show the item count and total of the selected items", () => {
      renderCheckout({ selectedItemIds: [1, 2] });

      expect(screen.getByText("Subtotal (3 items)")).toBeInTheDocument();
      expect(screen.getByText("Total").nextElementSibling).toHaveTextContent(
        formatPrice(99.99 * 2 + 12.5)
      );
    });
  });

  describe("Not yet available", () => {
    it("should explain that checkout is not available yet", () => {
      renderCheckout({ selectedItemIds: [1] });

      expect(screen.getByRole("note")).toHaveTextContent("Checkout is not available yet.");
    });

    it("should disable Place order and explain why", () => {
      renderCheckout({ selectedItemIds: [1] });

      const placeOrder = screen.getByRole("button", { name: "Place order" });
      expect(placeOrder).toBeDisabled();
      expect(placeOrder).toHaveAccessibleDescription("Ordering will be available soon");
    });

    it("should link back to the cart", () => {
      renderCheckout({ selectedItemIds: [1] });

      expect(screen.getByRole("link", { name: "Back to cart" })).toHaveAttribute("href", "/cart");
    });
  });
});
