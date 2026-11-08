import { beforeEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useCartItemQuantity, useCartStore } from "./useCartStore";
import { createCartItem } from "../test/factories";

const getItems = () => useCartStore.getState().items;

type PersistedCart = { state: Record<string, unknown>; version: number };

describe("useCartStore", () => {
  beforeEach(() => {
    useCartStore.setState({ items: {} });
  });

  describe("addItem", () => {
    it("should add a new product with the given quantity", () => {
      useCartStore.getState().addItem(createCartItem(1, 3));

      expect(getItems()).toEqual({ 1: createCartItem(1, 3) });
    });

    it("should add the quantity to an existing product instead of duplicating it", () => {
      useCartStore.getState().addItem(createCartItem(1, 2));
      useCartStore.getState().addItem(createCartItem(1, 3));

      expect(Object.keys(getItems())).toEqual(["1"]);
      expect(getItems()[1]?.quantity).toBe(5);
    });

    it("should not change other products in the cart", () => {
      useCartStore.setState({ items: { 2: createCartItem(2, 4) } });

      useCartStore.getState().addItem(createCartItem(1, 1));

      expect(getItems()[2]).toEqual(createCartItem(2, 4));
    });

    it("should return a new items object (immutable update)", () => {
      const existing = createCartItem(1, 2);
      useCartStore.setState({ items: { 1: existing } });
      const itemsBefore = getItems();

      useCartStore.getState().addItem(createCartItem(1, 3));

      expect(getItems()).not.toBe(itemsBefore);
      expect(getItems()[1]).not.toBe(existing);
      expect(existing.quantity).toBe(2);
    });
  });

  describe("removeItem", () => {
    it("should remove the product from the cart", () => {
      useCartStore.setState({ items: { 1: createCartItem(1, 1), 2: createCartItem(2, 1) } });

      useCartStore.getState().removeItem(1);

      expect(getItems()).toEqual({ 2: createCartItem(2, 1) });
    });

    it("should do nothing when the product is not in the cart", () => {
      useCartStore.setState({ items: { 1: createCartItem(1, 1) } });

      useCartStore.getState().removeItem(99);

      expect(getItems()).toEqual({ 1: createCartItem(1, 1) });
    });
  });

  describe("updateQuantity", () => {
    beforeEach(() => {
      useCartStore.setState({ items: { 1: createCartItem(1, 2) } });
    });

    it("should set the quantity of an existing product", () => {
      useCartStore.getState().updateQuantity(1, 7);

      expect(getItems()[1]?.quantity).toBe(7);
    });

    it("should remove the product when the quantity is 0", () => {
      useCartStore.getState().updateQuantity(1, 0);

      expect(getItems()).toEqual({});
    });

    it("should remove the product when the quantity is negative", () => {
      useCartStore.getState().updateQuantity(1, -1);

      expect(getItems()).toEqual({});
    });

    it("should do nothing when the product is not in the cart", () => {
      useCartStore.getState().updateQuantity(99, 5);

      expect(getItems()).toEqual({ 1: createCartItem(1, 2) });
    });
  });

  describe("clearCart", () => {
    it("should remove all products", () => {
      useCartStore.setState({ items: { 1: createCartItem(1, 1), 2: createCartItem(2, 3) } });

      useCartStore.getState().clearCart();

      expect(getItems()).toEqual({});
    });
  });

  describe("persistence", () => {
    it('should save the items to localStorage under "cart-storage"', () => {
      useCartStore.getState().addItem(createCartItem(1, 2));

      const persisted = JSON.parse(localStorage.getItem("cart-storage")!) as PersistedCart;
      expect(persisted.state.items).toEqual({ 1: createCartItem(1, 2) });
    });

    it("should save only the items, with the current version", () => {
      useCartStore.getState().addItem(createCartItem(1, 2));

      const persisted = JSON.parse(localStorage.getItem("cart-storage")!) as PersistedCart;
      expect(Object.keys(persisted.state)).toEqual(["items"]);
      expect(persisted.version).toBe(1);
    });

    it("should restore a cart saved before versioning", async () => {
      const savedItems = { 3: createCartItem(3, 4) };
      localStorage.setItem(
        "cart-storage",
        JSON.stringify({ state: { items: savedItems }, version: 0 })
      );

      await useCartStore.persist.rehydrate();

      expect(getItems()).toEqual(savedItems);
    });
  });

  describe("useCartItemQuantity", () => {
    it("should return the quantity of a product in the cart", () => {
      useCartStore.setState({ items: { 1: createCartItem(1, 4) } });

      const { result } = renderHook(() => useCartItemQuantity(1));

      expect(result.current).toBe(4);
    });

    it("should return 0 for a product that is not in the cart", () => {
      const { result } = renderHook(() => useCartItemQuantity(99));

      expect(result.current).toBe(0);
    });

    it("should return 0 while the product id is unknown", () => {
      useCartStore.setState({ items: { 1: createCartItem(1, 4) } });

      const { result } = renderHook(() => useCartItemQuantity(undefined));

      expect(result.current).toBe(0);
    });

    it("should update when the product is added to the cart", () => {
      const { result } = renderHook(() => useCartItemQuantity(1));

      act(() => useCartStore.getState().addItem(createCartItem(1, 2)));

      expect(result.current).toBe(2);
    });
  });
});
