import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useOrders, useProductStats, useSales, useSampleOrders, useUserStats } from "./adminApi";
import { fetchWithAuth } from "./fetchWithAuth";
import { salesOverTimeSchema, sampleOrdersSchema } from "./adminSchemas";
import { SAMPLE_ORDERS, SAMPLE_SALES } from "./adminSampleData";
import { jsonResponse } from "../test/factories";

vi.mock("./fetchWithAuth", () => ({ fetchWithAuth: vi.fn() }));

// The shape DummyJSON returns for one cart, including the fields the admin area does not read
const createDummyCart = (id: number) => ({
  id,
  userId: id * 10,
  products: [
    {
      id: 1,
      title: "Product 1",
      price: 10,
      quantity: 3,
      total: 30,
      discountPercentage: 10,
      discountedTotal: 27,
      thumbnail: "https://cdn.dummyjson.com/1/thumbnail.webp",
    },
  ],
  total: 30,
  discountedTotal: 27,
  totalProducts: 1,
  totalQuantity: 3,
  isDeleted: false,
});

// A Response body can only be read once, so every call gets a new one
const respondWith = (body: unknown, status = 200) =>
  vi.mocked(fetchWithAuth).mockImplementation(() => Promise.resolve(jsonResponse(body, status)));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe("admin API", () => {
  beforeEach(() => {
    vi.mocked(fetchWithAuth).mockReset();
  });

  describe("useOrders", () => {
    const cartsResponse = {
      carts: [createDummyCart(1), createDummyCart(2)],
      total: 2,
      skip: 0,
      limit: 0,
    };

    it("should request every cart in one call", async () => {
      respondWith(cartsResponse);

      const { result } = renderHook(() => useOrders(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(fetchWithAuth).toHaveBeenCalledWith("https://dummyjson.com/carts?limit=0", undefined);
    });

    it("should turn each cart into an order", async () => {
      respondWith(cartsResponse);

      const { result } = renderHook(() => useOrders(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([
        { id: 1, userId: 10, itemCount: 3, total: 30, discountedTotal: 27 },
        { id: 2, userId: 20, itemCount: 3, total: 30, discountedTotal: 27 },
      ]);
    });

    it("should report an error when the request fails", async () => {
      respondWith({ message: "Internal server error" }, 500);

      const { result } = renderHook(() => useOrders(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe("Internal server error");
    });

    it("should report an error when the response is not a list of carts", async () => {
      respondWith(createDummyCart(1));

      const { result } = renderHook(() => useOrders(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe("Failed to load orders");
    });
  });

  describe("useProductStats", () => {
    // What DummyJSON returns for ?select=title,category,price,stock,rating (it always adds the id)
    const product = {
      id: 1,
      title: "Mascara",
      category: "beauty",
      price: 9.99,
      stock: 5,
      rating: 4.9,
    };
    const productsResponse = { products: [product], total: 1, skip: 0, limit: 0 };

    it("should request only the fields the charts use, for every product", async () => {
      respondWith(productsResponse);

      const { result } = renderHook(() => useProductStats(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(fetchWithAuth).toHaveBeenCalledWith(
        "https://dummyjson.com/products?limit=0&select=title,category,price,stock,rating",
        undefined
      );
      expect(result.current.data).toEqual([product]);
    });

    it("should send one request when several charts use the products at once", async () => {
      respondWith(productsResponse);

      const { result } = renderHook(() => [useProductStats(), useProductStats()], {
        wrapper: createWrapper(),
      });
      await waitFor(() => expect(result.current.every((query) => query.isSuccess)).toBe(true));

      expect(fetchWithAuth).toHaveBeenCalledOnce();
    });

    it("should report an error when a product has no stock value", async () => {
      respondWith({ ...productsResponse, products: [{ ...product, stock: undefined }] });

      const { result } = renderHook(() => useProductStats(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe("Failed to load product statistics");
    });
  });

  describe("useUserStats", () => {
    const user = { id: 1, role: "admin", gender: "female", age: 28 };

    it("should request the role, gender and age of every user", async () => {
      respondWith({ users: [user], total: 1, skip: 0, limit: 0 });

      const { result } = renderHook(() => useUserStats(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(fetchWithAuth).toHaveBeenCalledWith(
        "https://dummyjson.com/users?limit=0&select=role,gender,age",
        undefined
      );
      expect(result.current.data).toEqual([user]);
    });

    it("should keep a role the app does not know, so it can be shown as its own group", async () => {
      respondWith({ users: [{ ...user, role: "support" }], total: 1, skip: 0, limit: 0 });

      const { result } = renderHook(() => useUserStats(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.[0]?.role).toBe("support");
    });

    it("should report an error when the request fails", async () => {
      respondWith({ message: "Internal server error" }, 500);

      const { result } = renderHook(() => useUserStats(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe("Internal server error");
    });
  });

  describe("useSampleOrders", () => {
    it("should return the dated sample orders without a request", async () => {
      const { result } = renderHook(() => useSampleOrders(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(SAMPLE_ORDERS);
      expect(fetchWithAuth).not.toHaveBeenCalled();
    });

    it("should use sample data in the shape the server will return", () => {
      expect(sampleOrdersSchema.safeParse(SAMPLE_ORDERS).success).toBe(true);
      expect(SAMPLE_ORDERS.length).toBeGreaterThan(1000);
      expect(SAMPLE_ORDERS[0]?.date.startsWith("2025-11-01T")).toBe(true);
      expect(SAMPLE_ORDERS.at(-1)?.date.startsWith("2026-11-15T")).toBe(true);
      // Every calendar day in the window has at least one order, so short ranges still show data
      const daysWithOrders = new Set(SAMPLE_ORDERS.map((order) => order.date.slice(0, 10)));
      expect(daysWithOrders.size).toBeGreaterThan(360);
      // Same-day orders use different hours so a one-day line chart has more than one X point
      const firstDay = SAMPLE_ORDERS[0]?.date.slice(0, 10);
      const hoursOnFirstDay = new Set(
        SAMPLE_ORDERS.filter((order) => order.date.startsWith(`${firstDay}T`)).map((order) =>
          order.date.slice(11, 13)
        )
      );
      expect(hoursOnFirstDay.size).toBeGreaterThan(1);
    });
  });

  describe("useSales", () => {
    it("should return the sample sales without a request", async () => {
      const { result } = renderHook(() => useSales(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(SAMPLE_SALES);
      expect(fetchWithAuth).not.toHaveBeenCalled();
    });

    it("should use sample data in the shape the server will return", () => {
      expect(salesOverTimeSchema.safeParse(SAMPLE_SALES).success).toBe(true);
    });
  });
});
