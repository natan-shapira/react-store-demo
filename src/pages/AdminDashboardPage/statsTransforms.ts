import type { OrderStatus, SampleOrder } from "../../api/adminTypes";
import { ORDER_STATUSES } from "../../api/adminTypes";
import type { BarChartDataPoint } from "./charts/BarChart/BarChart";
import { ORDER_STATUS_COLORS } from "./charts/chartTheme";

// Pure functions that turn the data the admin hooks return into what a chart shows, for example
// orders per status, products per category, low-stock products or users per age group.
//
// They have no React or network code, so each one is tested on its own with plain input and output.
// Once the project's own server returns ready-made statistics, most of these functions move there:
// summing on the server is cheaper than sending every record to the browser.

// In the order an order goes through them, so the bars read from left to right
const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const filterByDateRange = <T extends { date: string }>(
  rows: readonly T[],
  { from, to }: { from: string; to: string }
): T[] => rows.filter((row) => row.date >= from && row.date <= to);

// One count per status from a list of orders (already narrowed by date when the view filters first).
// Named fields avoid computed keys, which some IDEs fail to resolve on OrderStatus.
export const countOrdersByStatus = (
  orders: readonly Pick<SampleOrder, "status">[]
): Record<OrderStatus, number> => {
  const counts: Record<OrderStatus, number> = {
    pending: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };

  for (const order of orders) {
    counts[order.status] += 1;
  }

  return counts;
};

// One bar per status, always all four and always in the same order
export const toStatusBars = (counts: Record<OrderStatus, number>): BarChartDataPoint[] =>
  ORDER_STATUSES.map((status) => ({
    label: ORDER_STATUS_LABELS[status],
    value: counts[status],
    color: ORDER_STATUS_COLORS[status],
  }));
