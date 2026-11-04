import type { CartItem, Product } from "../types";

export const createProduct = (overrides: Partial<Product> & Pick<Product, "id">): Product => ({
  title: `Product ${overrides.id}`,
  price: 10,
  description: "",
  category: "test",
  image: "",
  ...overrides,
});

export const createCartItem = (
  id: number,
  quantity: number,
  overrides: Partial<Product> = {}
): CartItem => ({ ...createProduct({ ...overrides, id }), quantity });

export const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
