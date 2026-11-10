import type { ComponentType, LazyExoticComponent } from "react";
import { lazyWithRetry } from "../../utils/lazyWithRetry";
import type { AdminDataSource } from "./adminDataSource";

export interface AdminSection {
  // Relative to /admin, e.g. "stock" is /admin/stock
  path: string;
  label: string;
  source: AdminDataSource;
  Page: LazyExoticComponent<ComponentType>;
}

// Shown at /admin before a section is chosen
export const AdminOverviewPage = lazyWithRetry(
  () => import("./AdminOverviewPage/AdminOverviewPage"),
  "AdminOverviewPage"
);

// The single list behind both the admin navbar and the admin routes in App.tsx
export const ADMIN_SECTIONS: AdminSection[] = [
  {
    path: "products-by-category",
    label: "Products by category",
    source: "dummyjson",
    Page: lazyWithRetry(
      () => import("./ProductsByCategoryPage/ProductsByCategoryPage"),
      "ProductsByCategoryPage"
    ),
  },
  {
    path: "stock",
    label: "Stock levels",
    source: "dummyjson",
    Page: lazyWithRetry(() => import("./StockLevelsPage/StockLevelsPage"), "StockLevelsPage"),
  },
  {
    path: "ratings",
    label: "Product ratings",
    source: "dummyjson",
    Page: lazyWithRetry(
      () => import("./ProductRatingsPage/ProductRatingsPage"),
      "ProductRatingsPage"
    ),
  },
  {
    path: "users",
    label: "Users",
    source: "dummyjson",
    Page: lazyWithRetry(() => import("./UsersPage/UsersPage"), "UsersPage"),
  },
  {
    path: "carts",
    label: "Cart values",
    source: "dummyjson",
    Page: lazyWithRetry(() => import("./CartValuesPage/CartValuesPage"), "CartValuesPage"),
  },
  {
    path: "sales",
    label: "Sales over time",
    source: "sample",
    Page: lazyWithRetry(() => import("./SalesOverTimePage/SalesOverTimePage"), "SalesOverTimePage"),
  },
  {
    path: "orders",
    label: "Orders by status",
    source: "sample",
    Page: lazyWithRetry(
      () => import("./OrdersByStatusPage/OrdersByStatusPage"),
      "OrdersByStatusPage"
    ),
  },
];
