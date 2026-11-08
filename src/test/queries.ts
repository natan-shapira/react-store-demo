import { screen } from "@testing-library/react";

// Quantity selectors render <span><span class="sr-only">Quantity: </span>{value}</span>,
// so the accessible text "Quantity: 2" is split across two elements and needs a custom matcher
export const getQuantity = () => {
  const element = screen.getByText(
    (_, node) => node?.tagName === "SPAN" && /^Quantity: \d+$/.test(node.textContent ?? "")
  );
  return Number(element.textContent?.replace("Quantity: ", ""));
};

// Prices are shown as a label followed by their value (e.g. <dt>Total</dt><dd>$10.00</dd>),
// and the value has no role or label of its own to query by
export const getValueAfterLabel = (label: string | RegExp) => {
  // eslint-disable-next-line testing-library/no-node-access -- see above
  const value = screen.getByText(label).nextElementSibling;
  if (!value) throw new Error(`No value follows the label ${String(label)}`);
  return value;
};

// Matches both "Add to cart" and "Add more to cart"; the product page appends the total
export const getAddToCartButton = () =>
  screen.getByRole("button", { name: /^add (more )?to cart/i });
