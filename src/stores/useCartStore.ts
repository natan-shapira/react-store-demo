import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "../types";
import { createSafeStorage } from "../utils/safeStorage";

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
    (set, get) => {
      const removeItemFromCart = (productId: number) => {
        const currentItems = { ...get().items };
        delete currentItems[productId];
        set({ items: currentItems });
      };
      return {
        items: {},

        addItem: (product) => {
          const currentItems = get().items;
          const productId = product.id;
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

        // removeItem: (productId) => {
        //   const currentItems = { ...get().items };
        //   delete currentItems[productId];
        //   set({ items: currentItems });
        // },
        removeItem: removeItemFromCart,

        updateQuantity: (productId, quantity) => {
          const currentItems = get().items;
          if (quantity <= 0) {
            // A quantity of 0 or less removes the product
            // const updatedItems = { ...currentItems };
            // delete updatedItems[productId];
            // set({ items: updatedItems });
            removeItemFromCart(productId);
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
      };
    },
    {
      name: "cart-storage",
      storage: createSafeStorage<Pick<CartState, "items">>(),
      version: 1,
      partialize: (state) => ({ items: state.items }),
      // version and migrate let a future change to the saved shape convert old data when it loads.
      // Data saved before versioning (version 0) already has the current shape, so it is kept as is
      migrate: (persistedState) => persistedState as Pick<CartState, "items">,
    }
  )
);

// Selects a number, so a component re-renders only when this product's quantity changes
export const useCartItemQuantity = (productId: number | undefined) =>
  useCartStore((state) => (productId === undefined ? 0 : (state.items[productId]?.quantity ?? 0)));
