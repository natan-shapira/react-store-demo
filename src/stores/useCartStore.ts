import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "../types";

interface CartState {
  // Items keyed by product id
  items: Record<number, CartItem>;

  addItem: (product: CartItem) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: {},

      // Adds a product, or increases its quantity if it is already in the cart
      addItem: (product) => {
        const currentItems = get().items;
        const productId = Number(product.id);
        const existingItem = currentItems[productId];

        if (existingItem) {
          set({
            items: {
              ...currentItems,
              [productId]: {
                ...existingItem,
                quantity: existingItem.quantity + product.quantity,
              },
            },
          });
        } else {
          set({
            items: {
              ...currentItems,
              [productId]: product,
            },
          });
        }
      },

      removeItem: (productId) => {
        const currentItems = { ...get().items };
        delete currentItems[productId];
        set({ items: currentItems });
      },

      updateQuantity: (productId, quantity) => {
        const currentItems = get().items;
        if (quantity <= 0) {
          // A quantity of 0 or less removes the product
          const updatedItems = { ...currentItems };
          delete updatedItems[productId];
          set({ items: updatedItems });
          return;
        }

        if (currentItems[productId]) {
          set({
            items: {
              ...currentItems,
              [productId]: {
                ...currentItems[productId],
                quantity,
              },
            },
          });
        }
      },

      clearCart: () => set({ items: {} }),
    }),
    {
      name: "cart-storage", // localStorage key
    }
  )
);
