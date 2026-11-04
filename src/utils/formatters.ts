// Formats a price in US dollars, e.g. 12.5 → "$12.50"
export const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};
