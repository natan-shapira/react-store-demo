import {
  ORDER_STATUSES,
  ORDER_STATUSES_WITH_ALL,
  type OrderStatus,
  type OrderStatusWithAll,
  type SampleOrder,
} from "../../api/adminTypes";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "./charts/chartTheme";
import type { ChartDataPoint } from "./charts/chartTypes";
import type { LineChartStatusPoint } from "./charts/LineChart/LineChart";
import { getDefined, mapKeysToRecord } from "./statusRecords";

// Status points always carry a color (bar + doughnut share this shape)
export type StatusChartPoint = ChartDataPoint & { color: NonNullable<ChartDataPoint["color"]> };

// Pure transforms from admin data into chart-ready shapes (no React / network).

// from/to are calendar days (YYYY-MM-DD); order.date is an ISO datetime — compare by day only
export const filterByDateRange = <T extends { date: string }>(
  rows: readonly T[],
  { from, to }: { from: string; to: string }
): T[] =>
  rows.filter((row) => {
    const day = row.date.slice(0, 10);
    return day >= from && day <= to;
  });

export const countOrdersByStatus = (
  orders: readonly Pick<SampleOrder, "status">[]
): Record<OrderStatusWithAll, number> => {
  const counts = emptyStatusCounts();

  for (const order of orders) {
    counts[order.status] += 1;
  }
  counts.all = orders.length;

  return counts;
};

export const toStatusChartPoints = (
  counts: Record<OrderStatus, number>
): StatusChartPoint[] =>
  ORDER_STATUSES.map((status) => ({
    label: getDefined(ORDER_STATUS_LABELS, status),
    value: getDefined(counts, status),
    color: getDefined(ORDER_STATUS_COLORS, status),
  }));

const emptyStatusCounts = (): Record<OrderStatusWithAll, number> =>
  mapKeysToRecord(ORDER_STATUSES_WITH_ALL, () => 0);

const emptyDayStatusCounts = (): Record<OrderStatus, number> =>
  mapKeysToRecord(ORDER_STATUSES, () => 0);

// One calendar day → hourly buckets; multi-day range → one bucket per day
const toTimeBucket = (date: string, byHour: boolean): string => {
  const day = date.slice(0, 10);
  if (!byHour) return day;
  const hour = date.length >= 13 ? date.slice(11, 13) : "00";
  return `${day} ${hour}:00`;
};

export const countOrdersByDayAndStatus = (
  orders: readonly Pick<SampleOrder, "date" | "status">[]
): LineChartStatusPoint[] => {
  const calendarDays = new Set(orders.map((order) => order.date.slice(0, 10)));
  const byHour = calendarDays.size <= 1;
  const byBucket = new Map<string, Record<OrderStatus, number>>();

  for (const { date, status } of orders) {
    const bucket = toTimeBucket(date, byHour);
    const counts = byBucket.get(bucket) ?? emptyDayStatusCounts();
    counts[status] += 1;
    byBucket.set(bucket, counts);
  }

  return [...byBucket.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([label, values]) => ({ label, values }));
};
