import { describe, expect, it } from "vitest";
import {
  countOrdersByDayAndStatus,
  countOrdersByStatus,
  filterByDateRange,
  toStatusChartPoints,
} from "./statsTransforms";
import { ORDER_STATUS_COLORS } from "./charts/chartTheme";
import type { SampleOrder } from "../../api/adminTypes";

const order = (
  overrides: Partial<SampleOrder> & Pick<SampleOrder, "status" | "date">
): SampleOrder => ({
  id: 1,
  userId: 1,
  itemCount: 1,
  total: 10,
  discountedTotal: 10,
  ...overrides,
});

describe("filterByDateRange", () => {
  it("should keep only rows whose calendar day is inside the range", () => {
    const rows = [
      order({ id: 1, date: "2026-11-01T10:00:00.000Z", status: "pending" }),
      order({ id: 2, date: "2026-11-10T14:00:00.000Z", status: "shipped" }),
      order({ id: 3, date: "2026-11-20T09:00:00.000Z", status: "delivered" }),
    ];

    expect(
      filterByDateRange(rows, { from: "2026-11-05", to: "2026-11-15" }).map((row) => row.id)
    ).toEqual([2]);
  });
});

describe("countOrdersByStatus", () => {
  it("should count how many orders are in each status", () => {
    expect(
      countOrdersByStatus([
        order({ date: "2026-11-01T08:00:00.000Z", status: "pending" }),
        order({ date: "2026-11-02T09:00:00.000Z", status: "pending" }),
        order({ date: "2026-11-03T10:00:00.000Z", status: "delivered" }),
        order({ date: "2026-11-04T11:00:00.000Z", status: "cancelled" }),
      ])
    ).toEqual({ all: 4, pending: 2, shipped: 0, delivered: 1, cancelled: 1 });
  });

  it("should show 0 for every status when there are no orders", () => {
    expect(countOrdersByStatus([])).toEqual({
      all: 0,
      pending: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    });
  });
});

describe("toStatusChartPoints", () => {
  it("should make one labelled point per status with its count and color", () => {
    const counts = { pending: 2, shipped: 4, delivered: 5, cancelled: 1 };

    expect(toStatusChartPoints(counts)).toEqual([
      { label: "Pending", value: 2, color: ORDER_STATUS_COLORS.pending },
      { label: "Shipped", value: 4, color: ORDER_STATUS_COLORS.shipped },
      { label: "Delivered", value: 5, color: ORDER_STATUS_COLORS.delivered },
      { label: "Cancelled", value: 1, color: ORDER_STATUS_COLORS.cancelled },
    ]);
  });

  it("should keep the points in fixed status order", () => {
    expect(
      toStatusChartPoints({ pending: 1, shipped: 1, delivered: 1, cancelled: 1 }).map(
        (point) => point.label
      )
    ).toEqual(["Pending", "Shipped", "Delivered", "Cancelled"]);
  });
});

describe("countOrdersByDayAndStatus", () => {
  it("should bucket by hour when all orders share one calendar day", () => {
    expect(
      countOrdersByDayAndStatus([
        order({ date: "2026-11-03T08:00:00.000Z", status: "pending" }),
        order({ date: "2026-11-03T08:30:00.000Z", status: "shipped" }),
        order({ date: "2026-11-03T14:00:00.000Z", status: "delivered" }),
      ])
    ).toEqual([
      {
        label: "2026-11-03 08:00",
        values: { pending: 1, shipped: 1, delivered: 0, cancelled: 0 },
      },
      {
        label: "2026-11-03 14:00",
        values: { pending: 0, shipped: 0, delivered: 1, cancelled: 0 },
      },
    ]);
  });

  it("should bucket by day when orders span more than one calendar day", () => {
    expect(
      countOrdersByDayAndStatus([
        order({ date: "2026-11-03T08:00:00.000Z", status: "pending" }),
        order({ date: "2026-11-03T20:00:00.000Z", status: "pending" }),
        order({ date: "2026-11-04T09:00:00.000Z", status: "shipped" }),
      ])
    ).toEqual([
      {
        label: "2026-11-03",
        values: { pending: 2, shipped: 0, delivered: 0, cancelled: 0 },
      },
      {
        label: "2026-11-04",
        values: { pending: 0, shipped: 1, delivered: 0, cancelled: 0 },
      },
    ]);
  });

  it("should return an empty list when there are no orders", () => {
    expect(countOrdersByDayAndStatus([])).toEqual([]);
  });
});
