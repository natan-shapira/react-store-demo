import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "./fetchJson";
import {
  dummyCartsResponseSchema,
  productStatsResponseSchema,
  userStatsResponseSchema,
  type DummyCart,
} from "./adminSchemas";
import { SAMPLE_ORDERS, SAMPLE_SALES } from "./adminSampleData";

// Data hooks for the admin charts, one per data set (built with React Query, like products.ts).
//
// Where the data comes from:
// - Products and users: DummyJSON (GET /products, /users), asking only for the fields the charts use.
// - Orders: DummyJSON has no orders, so its carts (GET /carts) stand in for them.
// - Sales and dated orders: DummyJSON has neither, so those hooks return the sample data in
//   adminSampleData.ts. Status charts count a date-filtered slice of SAMPLE_ORDERS in the view.
//
// Once the project has its own server, each hook only changes its queryFn to call the server's
// admin endpoint. The pages and charts keep using the same hooks and do not notice the switch.
//
// Only admin pages may import this file, so it stays out of the bundle every user downloads.
// All query keys start with "admin", so the admin data can be cleared in one call on logout.

const API_URL = import.meta.env.VITE_API_URL;

// One request feeds the products-by-category, stock and ratings charts: the pages share this
// query key, so React Query sends it once and serves the other pages from its cache
export const useProductStats = () =>
  useQuery({
    queryKey: ["admin", "products"],
    queryFn: async () => {
      const data = await fetchJson(
        `${API_URL}/products?limit=0&select=title,category,price,stock,rating`,
        productStatsResponseSchema,
        "Failed to load product statistics"
      );
      return data.products;
    },
  });

export const useUserStats = () =>
  useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const data = await fetchJson(
        `${API_URL}/users?limit=0&select=role,gender,age`,
        userStatsResponseSchema,
        "Failed to load user statistics"
      );
      return data.users;
    },
  });

// An order as the admin pages see it. Mapping DummyJSON's cart to this shape keeps its field
// names out of the pages; the project's own server will add fields such as a date and a status.
export interface AdminOrder {
  id: number;
  userId: number;
  itemCount: number;
  total: number;
  discountedTotal: number;
}

const toOrder = (cart: DummyCart): AdminOrder => ({
  id: cart.id,
  userId: cart.userId,
  itemCount: cart.totalQuantity,
  total: cart.total,
  discountedTotal: cart.discountedTotal,
});

export const useOrders = () =>
  useQuery({
    queryKey: ["admin", "orders"],
    queryFn: async () => {
      // ?limit=0 returns every cart in one response
      const data = await fetchJson(
        `${API_URL}/carts?limit=0`,
        dummyCartsResponseSchema,
        "Failed to load orders"
      );
      return data.carts.map(toOrder);
    },
  });

export const useSales = () =>
  useQuery({
    queryKey: ["admin", "sales"],
    // No request is made; with a server this becomes
    // fetchJson(`${API_URL}/admin/sales`, salesOverTimeSchema, "Failed to load sales")
    queryFn: () => Promise.resolve(SAMPLE_SALES),
  });

// Dated sample orders for status / over-time / table views. With a server this becomes an admin
// orders endpoint; the views keep filtering by date and counting locally until the server does it.
export const useSampleOrders = () =>
  useQuery({
    queryKey: ["admin", "sample-orders"],
    queryFn: () => Promise.resolve(SAMPLE_ORDERS),
  });
