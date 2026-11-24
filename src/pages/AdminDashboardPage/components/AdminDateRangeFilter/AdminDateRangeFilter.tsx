import type { DateRangePreset } from "./dateRange";
import { useAdminDateRange } from "./useAdminDateRange";

interface AdminDateRangeFilterProps {
  earliestAllowedDate: string;
  latestAllowedDate: string;
  defaultPreset?: "day" | "week" | "month" | "year";
  defaultFrom?: string;
  defaultTo?: string;
}

function AdminDateRangeFilter({
  earliestAllowedDate,
  latestAllowedDate,
  defaultPreset = "month",
  defaultFrom,
  defaultTo,
}: AdminDateRangeFilterProps) {
  const { selection, setPreset, setCustomRange } = useAdminDateRange({
    earliestAllowedDate,
    latestAllowedDate,
    defaultPreset,
    defaultFrom,
    defaultTo,
  });

  const PRESETS: { id: DateRangePreset; label: string }[] = [
    { id: "day", label: "Day" },
    { id: "week", label: "Week" },
    { id: "month", label: "Month" },
    { id: "year", label: "Year" },
    { id: "custom", label: "Custom" },
  ];

  return (
    <div role="group" aria-label="Date range" className="space-y-3">
      <ul className="flex flex-wrap gap-2">
        {PRESETS.map(({ id, label }) => {
          const isActive = selection.preset === id;
          return (
            <li key={id}>
              <button
                type="button"
                aria-pressed={isActive}
                onClick={() => setPreset(id)}
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {label}
              </button>
            </li>
          );
        })}
      </ul>
      {selection.preset === "custom" && (
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            From
            <input
              type="date"
              value={selection.from}
              min={earliestAllowedDate}
              max={selection.to}
              onChange={(e) =>
                setCustomRange({
                  preset: "custom",
                  from: e.target.value,
                  to: selection.to,
                })
              }
              className="rounded-md border border-gray-300 px-2 py-1"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            To
            <input
              type="date"
              value={selection.to}
              min={selection.from}
              max={latestAllowedDate}
              onChange={(e) =>
                setCustomRange({
                  preset: "custom",
                  from: selection.from,
                  to: e.target.value,
                })
              }
              className="rounded-md border border-gray-300 px-2 py-1"
            />
          </label>
        </div>
      )}
    </div>
  );
}
export default AdminDateRangeFilter;
