import { describe, expect, it } from "vitest";
import { countOrdersByStatus, filterByDateRange, toStatusBars } from "./statsTransforms";
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
  it("should keep only rows whose date is inside the range", () => {
    const rows = [
      order({ id: 1, date: "2026-11-01", status: "pending" }),
      order({ id: 2, date: "2026-11-10", status: "shipped" }),
      order({ id: 3, date: "2026-11-20", status: "delivered" }),
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
        order({ date: "2026-11-01", status: "pending" }),
        order({ date: "2026-11-02", status: "pending" }),
        order({ date: "2026-11-03", status: "delivered" }),
        order({ date: "2026-11-04", status: "cancelled" }),
      ])
    ).toEqual({ pending: 2, shipped: 0, delivered: 1, cancelled: 1 });
  });

  it("should show 0 for every status when there are no orders", () => {
    expect(countOrdersByStatus([])).toEqual({
      pending: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    });
  });
});

describe("toStatusBars", () => {
  it("should make one labelled bar per status with its count and color", () => {
    const counts = { pending: 2, shipped: 4, delivered: 5, cancelled: 1 };

    expect(toStatusBars(counts)).toEqual([
      { label: "Pending", value: 2, color: ORDER_STATUS_COLORS.pending },
      { label: "Shipped", value: 4, color: ORDER_STATUS_COLORS.shipped },
      { label: "Delivered", value: 5, color: ORDER_STATUS_COLORS.delivered },
      { label: "Cancelled", value: 1, color: ORDER_STATUS_COLORS.cancelled },
    ]);
  });

  it("should keep the bars in fixed status order", () => {
    expect(
      toStatusBars({ pending: 1, shipped: 1, delivered: 1, cancelled: 1 }).map((bar) => bar.label)
    ).toEqual(["Pending", "Shipped", "Delivered", "Cancelled"]);
  });
});
