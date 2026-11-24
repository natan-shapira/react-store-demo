export type DateRangePreset = "day" | "week" | "month" | "year" | "custom";

export interface DateRange {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
}

export interface DateRangeSelection extends DateRange {
  preset: DateRangePreset;
}

// Inclusive ranges ending at anchor: day=1, week=7, month=30, year=365
export function rangeForPreset(
  preset: Exclude<DateRangePreset, "custom">,
  anchor: string
): DateRange {
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

const DAY_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export function isValidDateString(value: string): boolean {
  if (!DAY_RE.test(value)) return false;
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function isValidRange(range: DateRange): boolean {
  return isValidDateString(range.from) && isValidDateString(range.to) && range.from <= range.to;
}

export function isDateRangePreset(value: string): value is DateRangePreset {
  return (
    value === "day" ||
    value === "week" ||
    value === "month" ||
    value === "year" ||
    value === "custom"
  );
}
