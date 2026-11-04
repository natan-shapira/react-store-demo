import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import ProductModalContent from "./ProductModalContent";
import { useCartStore } from "../../stores/useCartStore";
import { useModalStore } from "../../stores/useModalStore";
import type { Product } from "../../types";
import { getAddToCartButton, getQuantity } from "../../test/queries";

const product: Product = {
  id: 3,
  title: "Wireless Headphones",
  price: 25,
  description: "Noise cancelling headphones",
  category: "electronics",
  image: "headphones.jpg",
};

const renderContent = () => {
  const user = userEvent.setup();
  render(<ProductModalContent product={product} />);
  return { user };
};

const getTotal = () => screen.getByText("Total").nextElementSibling;

describe("ProductModalContent", () => {
  beforeEach(() => {
    useCartStore.setState({ items: {} });
    useModalStore.setState({ content: <p>Open modal</p>, title: "Open modal" });
  });

  describe("Display", () => {
    it("should show the image, description, category and unit price", () => {
      renderContent();

      expect(screen.getByRole("img", { name: "Wireless Headphones" })).toHaveAttribute(
        "src",
        "headphones.jpg"
      );
      expect(screen.getByText("Noise cancelling headphones")).toBeInTheDocument();
      expect(screen.getByText("electronics")).toBeInTheDocument();
      expect(screen.getByText("Unit price").nextElementSibling).toHaveTextContent("$25.00");
    });

    it("should not render its own heading (the title comes from ModalWrapper)", () => {
      renderContent();

      expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    });

    it("should show the quantity already in the cart", () => {
      useCartStore.setState({ items: { 3: { ...product, quantity: 2 } } });
      renderContent();

      expect(screen.getByText("This product is already in your cart")).toBeInTheDocument();
      expect(screen.getByText("2 in cart")).toBeInTheDocument();
    });

    it("should not show the in-cart message when the product is not in the cart", () => {
      renderContent();

      expect(screen.queryByText("This product is already in your cart")).not.toBeInTheDocument();
    });
  });

  describe("Quantity selector", () => {
    it("should start at 1", () => {
      renderContent();

      expect(getQuantity()).toBe(1);
    });

    it("should increase and decrease the quantity", async () => {
      const { user } = renderContent();

      await user.click(screen.getByLabelText("Increase quantity"));
      await user.click(screen.getByLabelText("Increase quantity"));
      expect(getQuantity()).toBe(3);

      await user.click(screen.getByLabelText("Decrease quantity"));
      expect(getQuantity()).toBe(2);
    });

    it("should not go below 1", async () => {
      const { user } = renderContent();

      await user.click(screen.getByLabelText("Decrease quantity"));

      expect(getQuantity()).toBe(1);
    });

    it("should update the total (price × quantity)", async () => {
      const { user } = renderContent();
      expect(getTotal()).toHaveTextContent("$25.00");

      await user.click(screen.getByLabelText("Increase quantity"));
      await user.click(screen.getByLabelText("Increase quantity"));

      expect(getTotal()).toHaveTextContent("$75.00");
    });
  });

  describe("Add to cart", () => {
    it("should add the product with the selected quantity", async () => {
      const { user } = renderContent();

      await user.click(screen.getByLabelText("Increase quantity"));
      await user.click(getAddToCartButton());

      expect(useCartStore.getState().items[3]).toEqual({ ...product, quantity: 2 });
    });

    it("should close the modal after adding", async () => {
      const { user } = renderContent();

      await user.click(getAddToCartButton());

      expect(useModalStore.getState().content).toBeNull();
    });

    it('should show "Add more to cart" when the product is already in the cart', () => {
      useCartStore.setState({ items: { 3: { ...product, quantity: 2 } } });
      renderContent();

      expect(getAddToCartButton()).toHaveTextContent("Add more to cart");
    });
  });
});
