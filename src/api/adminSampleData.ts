import type { OrderStatus, SalesPoint, SampleOrder } from "./adminTypes";

// Hand-made sample data for the admin charts that DummyJSON cannot feed.
//
// The data has the shape the project's own server is expected to return, so replacing it later
// means swapping the source in adminApi.ts, not changing the charts. It is made up and must
// never contain real customer data, since everything in the client code is public.

export const SAMPLE_SALES: SalesPoint[] = [
  { month: "2025-11", revenue: 18_420, orders: 142 },
  { month: "2025-12", revenue: 27_950, orders: 211 },
  { month: "2026-01", revenue: 15_300, orders: 118 },
  { month: "2026-02", revenue: 16_840, orders: 127 },
  { month: "2026-03", revenue: 19_610, orders: 150 },
  { month: "2026-04", revenue: 21_080, orders: 163 },
  { month: "2026-05", revenue: 22_470, orders: 171 },
  { month: "2026-06", revenue: 20_960, orders: 158 },
  { month: "2026-07", revenue: 23_390, orders: 176 },
  { month: "2026-08", revenue: 24_150, orders: 184 },
  { month: "2026-09", revenue: 22_830, orders: 169 },
  { month: "2026-10", revenue: 25_720, orders: 193 },
];

// Fixed window aligned with SAMPLE_SALES: a full year ending mid-November. Date-range filters
// (7 days, 30 days, a quarter, custom) all cut into this list and still find orders.
export const SAMPLE_ORDERS_FROM = "2025-11-01";
export const SAMPLE_ORDERS_TO = "2026-11-15";

// Delivered is the most common, then shipped, pending and cancelled
const statusFor = (seed: number): OrderStatus => {
  const roll = seed % 20;
  if (roll < 12) return "delivered";
  if (roll < 16) return "shipped";
  if (roll < 18) return "pending";
  return "cancelled";
};

const toIsoDate = (date: Date): string => date.toISOString().slice(0, 10);

const eachDate = (from: string, to: string): string[] => {
  const dates: string[] = [];
  const cursor = new Date(`${from}T00:00:00.000Z`);
  const end = new Date(`${to}T00:00:00.000Z`);

  while (cursor.getTime() <= end.getTime()) {
    dates.push(toIsoDate(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates;
};

// Builds one order list that Over time, status charts and the orders table can all filter by date.
// Every day in the window has at least two orders, so short ranges (7 / 30 days) always show data.
// An empty result is still possible later by picking a range outside SAMPLE_ORDERS_FROM..TO.
const buildSampleOrders = (): SampleOrder[] => {
  const orders: SampleOrder[] = [];
  let id = 1;

  for (const date of eachDate(SAMPLE_ORDERS_FROM, SAMPLE_ORDERS_TO)) {
    const day = Number(date.slice(8, 10));
    const weekday = new Date(`${date}T00:00:00.000Z`).getUTCDay(); // 0 = Sunday
    const isWeekend = weekday === 0 || weekday === 6;
    const isMonthEnd = day >= 28;

    // Base 2–5 orders; weekends +1, month end +2
    let ordersThatDay = 2 + (day % 4);
    if (isWeekend) ordersThatDay += 1;
    if (isMonthEnd) ordersThatDay += 2;

    for (let i = 0; i < ordersThatDay; i++) {
      const seed = id * 17 + day * 3 + weekday;
      const total = 20 + (seed % 180) + (seed % 7) / 100;
      const discount = (seed % 15) / 100;
      const order: SampleOrder = {
        id,
        userId: 1 + (seed % 48),
        date,
        status: statusFor(seed),
        itemCount: 1 + (seed % 6),
        total: Math.round(total * 100) / 100,
        discountedTotal: Math.round(total * (1 - discount) * 100) / 100,
      };
      orders.push(order);
      id += 1;
    }
  }

  return orders;
};

export const SAMPLE_ORDERS: SampleOrder[] = buildSampleOrders();
