import { useState } from "react";

const MIN_QUANTITY = 1;

// The quantity a user picks before adding a product to the cart
export function useQuantity() {
  const [quantity, setQuantity] = useState(MIN_QUANTITY);

  return {
    quantity,
    increase: () => setQuantity((prev) => prev + 1),
    decrease: () => setQuantity((prev) => Math.max(MIN_QUANTITY, prev - 1)),
    reset: () => setQuantity(MIN_QUANTITY),
  };
}
