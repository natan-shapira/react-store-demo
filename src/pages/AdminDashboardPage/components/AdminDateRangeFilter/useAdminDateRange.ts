import { useSearchParams } from "react-router-dom";
import {
  clampRange,
  rangeForPreset,
  type DateRangePreset,
  type DateRangeSelection,
} from "./dateRange";

interface UseAdminDateRangeOptions {
  earliestAllowedDate: string; // התאריך המינימלי המותר במערכת (למשל SAMPLE_ORDERS_FROM)
  latestAllowedDate: string; // התאריך המקסימלי/עוגן המותר במערכת (למשל SAMPLE_ORDERS_TO)
  defaultPreset?: Exclude<DateRangePreset, "custom">; // למשל "month"
}

interface UseAdminDateRangeResult {
  selection: DateRangeSelection;
  setPreset: (preset: DateRangePreset) => void;
  setCustomRange: (range: DateRangeSelection) => void;
}

export function useAdminDateRange({
  earliestAllowedDate,
  latestAllowedDate,
  defaultPreset = "month",
}: UseAdminDateRangeOptions): UseAdminDateRangeResult {
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. קריאת הפרמטרים מתוך ה־URL או שימוש בברירת המחדל
  const presetParam = (searchParams.get("range") as DateRangePreset) || defaultPreset;
  const urlFrom = searchParams.get("from");
  const urlTo = searchParams.get("to");

  let currentFrom: string;
  let currentTo: string;

  if (presetParam !== "custom" && (!urlFrom || !urlTo)) {
    // חישוב אוטומטי מבוסס פריסט ביחס לתאריך המקסימלי המותר (העוגן)
    const calculatedRange = rangeForPreset(presetParam, latestAllowedDate);
    const clampedCalculated = clampRange(calculatedRange, earliestAllowedDate, latestAllowedDate);
    currentFrom = clampedCalculated.from;
    currentTo = clampedCalculated.to;
  } else {
    const clampedUrlRange = clampRange(
      // מה המטרה של clampRange אם כבר יש לנו את earliestAllowedDate ו-latestAllowedDate? האם זה כדי לוודא שהטווח מה-URL לא חורג מהגבולות המותרים?
      {
        from: urlFrom || latestAllowedDate,
        to: urlTo || latestAllowedDate,
      },
      earliestAllowedDate,
      latestAllowedDate
    );
    currentFrom = clampedUrlRange.from;
    currentTo = clampedUrlRange.to;
  }

  const selection: DateRangeSelection = {
    preset: presetParam,
    from: currentFrom,
    to: currentTo,
  };

  const setPreset = (newPreset: DateRangePreset) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("range", newPreset);
    if (newPreset !== "custom") {
      const calculatedRange = rangeForPreset(newPreset, latestAllowedDate);
      const clampedRange = clampRange(calculatedRange, earliestAllowedDate, latestAllowedDate);
      newParams.set("from", clampedRange.from);
      newParams.set("to", clampedRange.to);
    } else {
      if (!newParams.get("from") || !newParams.get("to")) {
        newParams.set("from", selection.from);
        newParams.set("to", selection.to);
      }
    }
    setSearchParams(newParams);
  };

  const setCustomRange = (customRangeSelection: DateRangeSelection) => {
    const clampedCustomRange = clampRange(
      { from: customRangeSelection.from, to: customRangeSelection.to },
      earliestAllowedDate,
      latestAllowedDate
    );
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
