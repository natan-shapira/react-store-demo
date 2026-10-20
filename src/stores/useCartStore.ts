import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "../types";

interface CartState {
  // אובייקט שמחזיק את הפריטים לפי מזהה (ID) המוצר כמופתח
  items: Record<number, CartItem>;
  
  // פעולות על העגלה
  addItem: (product: CartItem) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: {},

      // הוספה או עדכון כמות של מוצר לעגלה
      addItem: (product) => {
        const currentItems = get().items;
        const productId = Number(product.id);
        const existingItem = currentItems[productId];

        if (existingItem) {
          // אם המוצר כבר קיים, נעדכן את הכמות בהתאם למה שנבחר
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
          // אם המוצר חדש בעגלה, נוסיף אותו
          set({
            items: {
              ...currentItems,
              [productId]: product,
            },
          });
        }
      },

      // הסרת מוצר מהעגלה לפי ID
      removeItem: (productId) => {
        const currentItems = { ...get().items };
        delete currentItems[productId];
        set({ items: currentItems });
      },

      // עדכון ישיר של כמות לפריט מסוים
      updateQuantity: (productId, quantity) => {
        const currentItems = get().items;
        if (quantity <= 0) {
          // אם הכמות ירדה ל-0 או פחות, נסיר את המוצר
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

      // ריקון מלא של העגלה
      clearCart: () => set({ items: {} }),
    }),
    {
      name: "cart-storage", // שם המפתח ב-localStorage
    }
  )
);