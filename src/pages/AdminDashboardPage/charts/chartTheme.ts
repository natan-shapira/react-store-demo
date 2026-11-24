import type { OrderStatus, OrderStatusWithAll } from "../../../api/adminTypes";

// CSS colors for Chart.js canvas (not Tailwind class names)

export type ChartColor = string;

export const CHART_PALETTE: readonly [ChartColor, ...ChartColor[]] = [
  "#2563eb", // blue-600
  "#059669", // emerald-600
  "#f59e0b", // amber-500
  "#7c3aed", // violet-600
  "#e11d48", // rose-600
  "#0891b2", // cyan-600
  "#f97316", // orange-500
  "#64748b", // slate-500
];

export const chartColor = (index: number): ChartColor =>
  CHART_PALETTE[index % CHART_PALETTE.length] ?? CHART_PALETTE[0];

export const ORDER_STATUS_COLORS: Record<OrderStatus, ChartColor> = {
  pending: "#f59e0b", // amber-500
  shipped: "#2563eb", // blue-600
  delivered: "#059669", // emerald-600
  cancelled: "#dc2626", // red-600
};

export const SERIES_COLORS_WITH_ALL: Record<OrderStatusWithAll, ChartColor> = {
  all: "#64748b", // slate-500
  ...ORDER_STATUS_COLORS,
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_LABELS_WITH_ALL: Record<OrderStatusWithAll, string> = {
  all: "All",
  ...ORDER_STATUS_LABELS,
};
