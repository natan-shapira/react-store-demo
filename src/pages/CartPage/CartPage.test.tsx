import { render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import CartPage from "./CartPage";
import { useCartStore } from "../../stores/useCartStore";
import { beforeEach, describe, expect, it } from "vitest";
import type { CartItem } from "../../types";
import userEvent from "@testing-library/user-event";
import { formatPrice } from "../../utils/formatters";

const cartItems: Record<number, CartItem> = {
  1: {
    id: 1,
    title: "Wireless Headphones",
    price: 100,
    description: "Noise cancelling over-ear headphones",
    category: "electronics",
    image: "headphones.jpg",
    quantity: 2,
  },
  2: {
    id: 2,
    title: "Coffee Mug",
    price: 12.5,
    description: "Ceramic mug, 350ml",
    category: "kitchen",
    image: "mug.jpg",
    quantity: 1,
  },
  3: {
    id: 3,
    title: "Notebook",
    price: 5,
    description: "A5 dotted notebook",
    category: "stationery",
    image: "notebook.jpg",
    quantity: 3,
  },
};

const CheckoutStateDisplay = () => (
  <pre data-testid="checkout-state">{JSON.stringify(useLocation().state)}</pre>
);

const renderCartPage = () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={["/cart"]}>
      <Routes>
        <Route path="/cart" element={<CartPage />} />
        <Route path="/" element={<div data-testid="home-page">Home Page</div>} />
        <Route path="/checkout" element={<CheckoutStateDisplay />} />
      </Routes>
    </MemoryRouter>
  );
  return { user };
};

const getRowCheckbox = (title: string) =>
  screen.queryByRole("checkbox", { name: `Select ${title}` });

const getRow = (title: string) => getRowCheckbox(title)!.closest("li")!;

const getCheckoutButton = () => screen.getByRole("button", { name: "Proceed to checkout" });

const getSelectAll = () =>
  screen.getByRole("checkbox", { name: /select all/i }) as HTMLInputElement;

const getSummaryPrice = (label: RegExp) =>
  Number(screen.getByText(label).nextElementSibling?.textContent?.replace("$", ""));

const getSelectedQuantity = () =>
  Number(screen.getByText(/^Subtotal/).textContent?.match(/\((\d+) items?\)/)?.[1]);

const getSelectedRows = () =>
  Number(screen.getByText(/of \d+ selected/).textContent?.match(/\((\d+) of/)?.[1]);

describe("CartPage", () => {
  beforeEach(() => {
    useCartStore.setState({ items: structuredClone(cartItems) });
  });

  it("should show the empty cart state when there are no items", () => {
    useCartStore.setState({ items: {} });

    renderCartPage();

    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /continue shopping/i })).toHaveAttribute("href", "/");
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.queryByText(/order summary/i)).not.toBeInTheDocument();
  });

  it('should set the title to "Cart" and focus the heading', () => {
    renderCartPage();

    expect(document.title).toBe("Cart | ReactShop");
    expect(screen.getByRole("heading", { level: 1, name: /shopping cart/i })).toHaveFocus();
  });

  it("should display cart items when items exist in store", () => {
    renderCartPage();

    expect(screen.getByText("Wireless Headphones")).toBeInTheDocument();
    expect(screen.getByText("Coffee Mug")).toBeInTheDocument();
    expect(screen.getByText("Notebook")).toBeInTheDocument();
  });

  it("should display the correct order summary", () => {
    const items = Object.values(cartItems);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    renderCartPage();

    expect(screen.getByText(`(${totalItems} items)`)).toBeInTheDocument();
    expect(screen.getByText(`Subtotal (${totalItems} items)`).nextElementSibling).toHaveTextContent(
      formatPrice(subtotal)
    );
    expect(screen.getByText("Shipping").nextElementSibling).toHaveTextContent("Free");
    expect(screen.getByText("Total").nextElementSibling).toHaveTextContent(formatPrice(subtotal));
  });

  it("should toggle the checkbox state when clicked", async () => {
    const { user } = renderCartPage();
    const checkbox = screen.getByRole("checkbox", {
      name: /select wireless headphones/i,
    }) as HTMLInputElement;
    const isChecked = checkbox.checked;
    await user.click(checkbox);
    expect(checkbox.checked).toBe(!isChecked);
  });

  describe("when an item checkbox is toggled", () => {
    const item = cartItems[1];
    if (!item) throw new Error("Test setup error: item not found");
    const lineTotal = item.price * item.quantity;
    const itemCount = Object.keys(cartItems).length;

    // Renders the page, captures the summary before the click and toggles the item
    const toggleItem = async () => {
      const { user } = renderCartPage();
      const checkbox = screen.getByRole("checkbox", {
        name: /select wireless headphones/i,
      }) as HTMLInputElement;
      const before = {
        direction: checkbox.checked ? -1 : 1,
        subtotal: getSummaryPrice(/^Subtotal/),
        total: getSummaryPrice(/^Total$/),
        selectedQuantity: getSelectedQuantity(),
        selectedRows: getSelectedRows(),
      };

      await user.click(checkbox);
      return before;
    };

    it("should change the subtotal by the item line total", async () => {
      const { direction, subtotal } = await toggleItem();
      expect(getSummaryPrice(/^Subtotal/)).toBeCloseTo(subtotal + direction * lineTotal);
    });

    it("should change the total by the item line total", async () => {
      const { direction, total } = await toggleItem();
      expect(getSummaryPrice(/^Total$/)).toBeCloseTo(total + direction * lineTotal);
    });

    it("should change the subtotal item count by the item quantity", async () => {
      const { direction, selectedQuantity } = await toggleItem();
      expect(getSelectedQuantity()).toBe(selectedQuantity + direction * (item?.quantity || 1));
    });

    it("should change the selected items counter by one", async () => {
      const { direction, selectedRows } = await toggleItem();
      expect(
        screen.getByText(`(${selectedRows + direction} of ${itemCount} selected)`)
      ).toBeInTheDocument();
    });

    it("should update the select all checkbox state", async () => {
      const { direction, selectedRows } = await toggleItem();
      const selectAll = screen.getByRole("checkbox", { name: /select all/i }) as HTMLInputElement;
      const selectedAfter = selectedRows + direction;

      expect(selectAll.checked).toBe(selectedAfter === itemCount);
      expect(selectAll.indeterminate).toBe(selectedAfter > 0 && selectedAfter < itemCount);
    });

    it("should not change the cart contents", async () => {
      await toggleItem();
      expect(useCartStore.getState().items).toEqual(cartItems);
    });
  });

  it("should select an item again when its checkbox is clicked a second time", async () => {
    const { user } = renderCartPage();
    const checkbox = getRowCheckbox("Coffee Mug")!;

    await user.click(checkbox);
    await user.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(screen.getByText("(3 of 3 selected)")).toBeInTheDocument();
  });

  describe("Select all", () => {
    it("should deselect every item when all are selected", async () => {
      const { user } = renderCartPage();

      await user.click(getSelectAll());

      expect(screen.getByText("(0 of 3 selected)")).toBeInTheDocument();
      expect(getSelectAll().checked).toBe(false);
      expect(getCheckoutButton()).toBeDisabled();
    });

    it("should select every item when only some are selected", async () => {
      const { user } = renderCartPage();
      await user.click(screen.getByRole("checkbox", { name: /select coffee mug/i }));

      await user.click(getSelectAll());

      expect(screen.getByText("(3 of 3 selected)")).toBeInTheDocument();
      expect(getSelectAll().checked).toBe(true);
    });
  });

  describe("Quantity", () => {
    it("should increase the quantity of an item", async () => {
      const { user } = renderCartPage();

      await user.click(
        within(getRow("Coffee Mug")).getByRole("button", { name: "Increase quantity" })
      );

      expect(useCartStore.getState().items[2]?.quantity).toBe(2);
      expect(within(getRow("Coffee Mug")).getByText(formatPrice(25))).toBeInTheDocument();
    });

    it("should decrease the quantity of an item", async () => {
      const { user } = renderCartPage();

      await user.click(
        within(getRow("Wireless Headphones")).getByRole("button", { name: "Decrease quantity" })
      );

      expect(useCartStore.getState().items[1]?.quantity).toBe(1);
    });

    it("should remove an item when its quantity is decreased below 1", async () => {
      const { user } = renderCartPage();

      await user.click(
        within(getRow("Coffee Mug")).getByRole("button", { name: "Decrease quantity" })
      );

      expect(getRowCheckbox("Coffee Mug")).not.toBeInTheDocument();
      expect(useCartStore.getState().items[2]).toBeUndefined();
    });

    it("should update the total when a quantity changes", async () => {
      const { user } = renderCartPage();

      await user.click(
        within(getRow("Wireless Headphones")).getByRole("button", { name: "Increase quantity" })
      );

      expect(screen.getByText("Total").nextElementSibling).toHaveTextContent(formatPrice(327.5));
    });
  });

  describe("Removing items", () => {
    it("should remove an item when its remove button is clicked", async () => {
      const { user } = renderCartPage();

      await user.click(
        within(getRow("Notebook")).getByRole("button", { name: "Remove from cart" })
      );

      expect(getRowCheckbox("Notebook")).not.toBeInTheDocument();
      expect(Object.keys(useCartStore.getState().items)).toEqual(["1", "2"]);
    });

    it("should show the empty cart state when the cart is cleared", async () => {
      const { user } = renderCartPage();

      await user.click(screen.getByRole("button", { name: "Clear cart" }));

      expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
      expect(useCartStore.getState().items).toEqual({});
    });
  });

  describe("Checkout", () => {
    it("should go to checkout with the ids of the selected items only", async () => {
      const { user } = renderCartPage();
      await user.click(screen.getByRole("checkbox", { name: /select coffee mug/i }));

      await user.click(getCheckoutButton());

      expect(JSON.parse(screen.getByTestId("checkout-state").textContent!)).toEqual({
        selectedItemIds: [1, 3],
      });
    });

    it("should enable checkout while at least one item is selected", () => {
      renderCartPage();

      expect(getCheckoutButton()).toBeEnabled();
    });
  });
});
