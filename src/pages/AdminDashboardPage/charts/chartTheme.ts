import type { OrderStatus } from "../../../api/adminTypes";

// The colors every admin chart draws with, so the same thing has the same color on every page.
// Chart.js paints on a canvas, so these are CSS color values, not Tailwind class names.

// CSS color Chart.js paints bars, slices and lines with
export type ChartColor = string;

// For series with no meaning of their own, e.g. product categories; chartColor() repeats it
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

// The color of the series at the given position; after the last color the palette starts over
export const chartColor = (index: number): ChartColor =>
  CHART_PALETTE[index % CHART_PALETTE.length] ?? CHART_PALETTE[0];

// Every order status keeps its color in every order view. Colors only support the labels:
// a chart must also name each status, for people who cannot tell the colors apart.
export const ORDER_STATUS_COLORS: Record<OrderStatus, ChartColor> = {
  pending: "#f59e0b", // amber-500
  shipped: "#2563eb", // blue-600
  delivered: "#059669", // emerald-600
  cancelled: "#dc2626", // red-600
};
