import { screen } from "@testing-library/react";

// Quantity selectors render <span><span class="sr-only">Quantity: </span>{value}</span>,
// so the accessible text "Quantity: 2" is split across two elements and needs a custom matcher
export const getQuantity = () => {
  const element = screen.getByText(
    (_, node) => node?.tagName === "SPAN" && /^Quantity: \d+$/.test(node.textContent ?? "")
  );
  return Number(element.textContent?.replace("Quantity: ", ""));
};

// Matches both "Add to cart" and "Add more to cart"; the product page appends the total
export const getAddToCartButton = () =>
  screen.getByRole("button", { name: /^add (more )?to cart/i });
