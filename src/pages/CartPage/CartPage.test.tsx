import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CartPage from "./CartPage";
import { useCartStore } from "../../stores/useCartStore";
import { beforeEach, describe, expect, it } from "vitest";
import type { CartItem } from "../../types";
import userEvent from "@testing-library/user-event";

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

const renderCartPage = () => {
    const user = userEvent.setup();
        render(
        <MemoryRouter initialEntries={["/cart"]}>
        <Routes>
            <Route path="/cart" element={<CartPage />} />
            <Route
            path="/"
            element={<div data-testid="home-page">Home Page</div>}
            />
        </Routes>
        </MemoryRouter>,
    );
    return {user}
};

const getSummaryPrice = (label: RegExp) =>
    Number(screen.getByText(label).nextElementSibling?.textContent?.replace('$', ''));

const getSelectedQuantity = () =>
    Number(screen.getByText(/^Subtotal/).textContent?.match(/\((\d+) items?\)/)?.[1]);

const getSelectedRows = () =>
    Number(screen.getByText(/of \d+ selected/).textContent?.match(/\((\d+) of/)?.[1]);

describe("CartPage", () => {
    beforeEach(() => {
        useCartStore.setState({ items: structuredClone(cartItems) });
    });

    it("shows the empty cart state when there are no items", () => {
        useCartStore.setState({ items: {} });

        renderCartPage();

        expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
        expect(
        screen.getByRole("link", { name: /continue shopping/i }),
        ).toHaveAttribute("href", "/");
        expect(screen.queryByRole("list")).not.toBeInTheDocument();
        expect(screen.queryByText(/order summary/i)).not.toBeInTheDocument();
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
        expect(screen.getByText(`Subtotal (${totalItems} items)`).nextElementSibling).toHaveTextContent(`$${subtotal.toFixed(2)}`);
        expect(screen.getByText("Shipping").nextElementSibling).toHaveTextContent("Free");
        expect(screen.getByText("Total").nextElementSibling).toHaveTextContent(`$${subtotal.toFixed(2)}`);
    });

    it('should toggle the checkbox state when clicked', async () => {
        const {user} = renderCartPage();
        const checkbox = screen.getByRole('checkbox', { name: /select wireless headphones/i })as HTMLInputElement;
        const isChecked = checkbox.checked;
        await user.click(checkbox);
        expect(checkbox.checked).toBe(!isChecked);
    })

    describe('when an item checkbox is toggled', () => {
        const item = cartItems[1];
        const lineTotal = item.price * item.quantity;
        const itemCount = Object.keys(cartItems).length;

        // Renders the page, captures the summary before the click and toggles the item
        const toggleItem = async () => {
            const { user } = renderCartPage();
            const checkbox = screen.getByRole('checkbox', { name: /select wireless headphones/i }) as HTMLInputElement;
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

        it('should change the subtotal by the item line total', async () => {
            const { direction, subtotal } = await toggleItem();
            expect(getSummaryPrice(/^Subtotal/)).toBeCloseTo(subtotal + direction * lineTotal);
        });

        it('should change the total by the item line total', async () => {
            const { direction, total } = await toggleItem();
            expect(getSummaryPrice(/^Total$/)).toBeCloseTo(total + direction * lineTotal);
        });

        it('should change the subtotal item count by the item quantity', async () => {
            const { direction, selectedQuantity } = await toggleItem();
            expect(getSelectedQuantity()).toBe(selectedQuantity + direction * item.quantity);
        });

        it('should change the selected items counter by one', async () => {
            const { direction, selectedRows } = await toggleItem();
            expect(screen.getByText(`(${selectedRows + direction} of ${itemCount} selected)`)).toBeInTheDocument();
        });

        it('should update the select all checkbox state', async () => {
            const { direction, selectedRows } = await toggleItem();
            const selectAll = screen.getByRole('checkbox', { name: /select all/i }) as HTMLInputElement;
            const selectedAfter = selectedRows + direction;

            expect(selectAll.checked).toBe(selectedAfter === itemCount);
            expect(selectAll.indeterminate).toBe(selectedAfter > 0 && selectedAfter < itemCount);
        });

        it('should not change the cart contents', async () => {
            await toggleItem();
            expect(useCartStore.getState().items).toEqual(cartItems);
        });
    });
});
