import { useSearchParams } from "react-router-dom";
import {
  clampRange,
  isDateRangePreset,
  isValidDateString,
  isValidRange,
  rangeForPreset,
  type DateRange,
  type DateRangePreset,
  type DateRangeSelection,
} from "./dateRange";

interface UseAdminDateRangeOptions {
  earliestAllowedDate: string;
  latestAllowedDate: string;
  defaultPreset?: Exclude<DateRangePreset, "custom">;
  // Used when the URL has no valid from/to (or as custom fallback)
  defaultFrom?: string;
  defaultTo?: string;
}

interface UseAdminDateRangeResult {
  selection: DateRangeSelection;
  setPreset: (preset: DateRangePreset) => void;
  setCustomRange: (range: DateRangeSelection) => void;
}

const resolveDay = (
  value: string | null | undefined,
  fallback: string,
  earliestAllowedDate: string,
  latestAllowedDate: string
): string => {
  const candidate = value && isValidDateString(value) ? value : fallback;
  const safeFallback = isValidDateString(fallback) ? fallback : latestAllowedDate;
  const day = isValidDateString(candidate) ? candidate : safeFallback;
  return clampRange({ from: day, to: day }, earliestAllowedDate, latestAllowedDate).from;
};

export function useAdminDateRange({
  earliestAllowedDate,
  latestAllowedDate,
  defaultPreset = "month",
  defaultFrom,
  defaultTo,
}: UseAdminDateRangeOptions): UseAdminDateRangeResult {
  const [searchParams, setSearchParams] = useSearchParams();

  const presetParam = searchParams.get("range");
  const preset: DateRangePreset =
    presetParam && isDateRangePreset(presetParam) ? presetParam : defaultPreset;

  const presetDefaults = clampRange(
    rangeForPreset(defaultPreset, latestAllowedDate),
    earliestAllowedDate,
    latestAllowedDate
  );
  const fallbackFrom = resolveDay(
    defaultFrom,
    presetDefaults.from,
    earliestAllowedDate,
    latestAllowedDate
  );
  const fallbackTo = resolveDay(
    defaultTo,
    presetDefaults.to,
    earliestAllowedDate,
    latestAllowedDate
  );

  const urlFrom = searchParams.get("from");
  const urlTo = searchParams.get("to");
  const urlRange: DateRange | null =
    urlFrom && urlTo && isValidRange({ from: urlFrom, to: urlTo })
      ? { from: urlFrom, to: urlTo }
      : null;

  let currentFrom: string;
  let currentTo: string;

  if (preset !== "custom" && !urlRange) {
    const calculatedRange = rangeForPreset(preset, latestAllowedDate);
    const clampedCalculated = clampRange(calculatedRange, earliestAllowedDate, latestAllowedDate);
    currentFrom = clampedCalculated.from;
    currentTo = clampedCalculated.to;
  } else {
    const clampedUrlRange = clampRange(
      urlRange ?? { from: fallbackFrom, to: fallbackTo },
      earliestAllowedDate,
      latestAllowedDate
    );
    currentFrom = clampedUrlRange.from;
    currentTo = clampedUrlRange.to;
  }

  const selection: DateRangeSelection = {
    preset,
    from: currentFrom,
    to: currentTo,
  };

  const setPreset = (newPreset: DateRangePreset) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("range", newPreset);
    if (newPreset !== "custom") {
      const calculatedRange = rangeForPreset(newPreset, latestAllowedDate);
      const clamped = clampRange(calculatedRange, earliestAllowedDate, latestAllowedDate);
      newParams.set("from", clamped.from);
      newParams.set("to", clamped.to);
    } else if (!urlRange) {
      newParams.set("from", selection.from);
      newParams.set("to", selection.to);
    }
    setSearchParams(newParams);
  };

  const setCustomRange = (customRangeSelection: DateRangeSelection) => {
    const raw = {
      from: isValidDateString(customRangeSelection.from)
        ? customRangeSelection.from
        : selection.from,
      to: isValidDateString(customRangeSelection.to) ? customRangeSelection.to : selection.to,
    };
    const clampedCustomRange = clampRange(raw, earliestAllowedDate, latestAllowedDate);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("range", "custom");
    newParams.set("from", clampedCustomRange.from);
    newParams.set("to", clampedCustomRange.to);
    setSearchParams(newParams);
  };

  return {
    selection,
    setPreset,
    setCustomRange,
  };
}

export default useAdminDateRange;
