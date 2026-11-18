export type DateRangePreset = "day" | "week" | "month" | "year" | "custom";
export interface DateRange {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
}

export interface DateRangeSelection extends DateRange {
  preset: DateRangePreset;
}

export function rangeForPreset(
  preset: Exclude<DateRangePreset, "custom">,
  anchor: string // YYYY-MM-DD
): DateRange {
  // day   → from = to = anchor
  // week  → 7 ימים שמסתיימים ב-anchor (כולל)
  // month → ~30 ימים או חודש לוח שנה — תבחרו כלל אחד ותישארו איתו
  // year  → 365 ימים שמסתיימים ב-anchor, או SAMPLE_ORDERS_FROM..TO
  const endDate = new Date(anchor);
  const startDate =
    preset === "day"
      ? new Date(anchor)
      : preset === "week"
        ? new Date(endDate.getTime() - 6 * 24 * 60 * 60 * 1000)
        : preset === "month"
          ? new Date(endDate.getTime() - 29 * 24 * 60 * 60 * 1000)
          : preset === "year"
            ? new Date(endDate.getTime() - 364 * 24 * 60 * 60 * 1000)
            : endDate;

  return {
    from: startDate.toISOString().slice(0, 10),
    to: endDate.toISOString().slice(0, 10),
  };
}

export function clampRange(range: DateRange, min: string, max: string): DateRange {
  let from = range.from < min ? min : range.from > max ? max : range.from;
  const to = range.to < min ? min : range.to > max ? max : range.to;
  if (from > to) {
    from = to;
  }
  return { from, to };
}
// export function isValidRange(range: DateRange): boolean{
//     return range.from <= range.to;
// }
