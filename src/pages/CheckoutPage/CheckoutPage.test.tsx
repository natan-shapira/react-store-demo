import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, expect, beforeEach } from "vitest";
import CheckoutPage from "./CheckoutPage";
import { useCartStore } from "../../stores/useCartStore";

describe("CheckoutPage", () => {
  beforeEach(() => {
    useCartStore.setState({ items: {} });
  });

  it("should redirect to /cart when no items are selected", () => {
    render(
      <MemoryRouter initialEntries={["/checkout"]}>
        <Routes>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/cart" element={<div data-testid="cart-page">Cart Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId("cart-page")).toBeInTheDocument();
  });

  it("should display cart items when items exist in store", () => {
    useCartStore.setState({
      items: {
        1: {
          id: 1,
          title: "Wireless Headphones",
          price: 99.99,
          description: "Great sound",
          category: "electronics",
          image: "test.jpg",
          quantity: 2,
        },
      },
    });

    render(
      <MemoryRouter initialEntries={[{ pathname: "/checkout", state: { selectedItemIds: [1] } }]}>
        <Routes>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/cart" element={<div data-testid="cart-page">Cart Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Wireless Headphones")).toBeInTheDocument();
    expect(screen.getByText("× 2")).toBeInTheDocument();
  });
});
