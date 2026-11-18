// Plain TypeScript types for admin sample/chart data. Kept apart from adminSchemas.ts so files
// that only need types (e.g. adminSampleData.ts) never depend on Zod's inferred types, which
// some IDEs fail to resolve (e.g. "Unsafe member access .status on a type that cannot be resolved").

export const ORDER_STATUSES = ["pending", "shipped", "delivered", "cancelled"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface OrderStatusCount {
  status: OrderStatus;
  count: number;
}

export interface SampleOrder {
  id: number;
  userId: number;
  // "YYYY-MM-DD", e.g. "2026-11-03"
  date: string;
  status: OrderStatus;
  itemCount: number;
  total: number;
  discountedTotal: number;
}

export interface SalesPoint {
  // "YYYY-MM", e.g. "2026-03"
  month: string;
  revenue: number;
  orders: number;
}
