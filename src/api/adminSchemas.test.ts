import { describe, expect, it } from "vitest";
import { dummyCartSchema, dummyCartsResponseSchema, salesPointSchema } from "./adminSchemas";

// Cart 2 exactly as GET https://dummyjson.com/carts returns it
const cart = {
  id: 2,
  products: [
    {
      id: 86,
      title: "Man Short Sleeve Shirt",
      price: 19.99,
      quantity: 5,
      total: 99.94999999999999,
      discountPercentage: 6.83,
      discountedTotal: 93.12,
      thumbnail:
        "https://cdn.dummyjson.com/product-images/mens-shirts/man-short-sleeve-shirt/thumbnail.webp",
    },
    {
      id: 104,
      title: "Apple iPhone Charger",
      price: 19.99,
      quantity: 2,
      total: 39.98,
      discountPercentage: 18.52,
      discountedTotal: 32.58,
      thumbnail:
        "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-iphone-charger/thumbnail.webp",
    },
  ],
  total: 139.93,
  discountedTotal: 125.7,
  userId: 2,
  totalProducts: 2,
  totalQuantity: 7,
};

const response = { carts: [cart], total: 208, skip: 0, limit: 1 };

const withFirstLine = (changes: Record<string, unknown>) => ({
  ...cart,
  products: [{ ...cart.products[0], ...changes }, cart.products[1]],
});

describe("dummyCartsResponseSchema", () => {
  it("should accept the response DummyJSON returns", () => {
    expect(dummyCartsResponseSchema.parse(response)).toEqual(response);
  });

  it("should accept a page with no carts", () => {
    const emptyPage = { carts: [], total: 208, skip: 300, limit: 30 };

    expect(dummyCartsResponseSchema.parse(emptyPage)).toEqual(emptyPage);
  });

  it("should reject a response without the carts list", () => {
    expect(dummyCartsResponseSchema.safeParse({ total: 208, skip: 0, limit: 30 }).success).toBe(
      false
    );
  });
});

describe("dummyCartSchema", () => {
  it("should leave out fields the admin area does not read", () => {
    const parsed = dummyCartSchema.parse({ ...cart, isDeleted: false });

    expect(parsed).not.toHaveProperty("isDeleted");
  });

  it.each([
    ["a fractional quantity", { quantity: 1.5 }],
    ["a zero quantity", { quantity: 0 }],
    ["a negative line total", { total: -1 }],
    ["a discount above 100%", { discountPercentage: 120 }],
    ["a price sent as text", { price: "19.99" }],
  ])("should reject a cart line with %s", (_, changes) => {
    expect(dummyCartSchema.safeParse(withFirstLine(changes)).success).toBe(false);
  });

  it("should reject a cart with a negative total", () => {
    expect(dummyCartSchema.safeParse({ ...cart, total: -5 }).success).toBe(false);
  });
});

describe("salesPointSchema", () => {
  const point = { month: "2026-03", revenue: 19_610, orders: 150 };

  it("should accept a month of sales", () => {
    expect(salesPointSchema.parse(point)).toEqual(point);
  });

  it.each(["2026-13", "2026-3", "March 2026"])("should reject the month %s", (month) => {
    expect(salesPointSchema.safeParse({ ...point, month }).success).toBe(false);
  });

  it("should reject negative revenue", () => {
    expect(salesPointSchema.safeParse({ ...point, revenue: -1 }).success).toBe(false);
  });
});
