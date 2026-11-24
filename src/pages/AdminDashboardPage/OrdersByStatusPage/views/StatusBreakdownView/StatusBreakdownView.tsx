import { useState } from "react";
import { SAMPLE_ORDERS_FROM, SAMPLE_ORDERS_TO } from "../../../../../api/adminSampleData";
import BarChart from "../../../charts/BarChart/BarChart";
import DoughnutChart from "../../../charts/DoughnutChart/DoughnutChart";
import AdminDateRangeFilter from "../../../components/AdminDateRangeFilter/AdminDateRangeFilter";
import AdminError from "../../../components/AdminError/AdminError";
import AdminLoading from "../../../components/AdminLoading/AdminLoading";
import { countOrdersByStatus, toStatusChartPoints } from "../../../statsTransforms";
import useOrdersInDateRange from "../../useOrdersInDateRange";

type StatusChartKind = "bars" | "donut";

const CHART_KINDS: { id: StatusChartKind; label: string }[] = [
  { id: "bars", label: "Bars" },
  { id: "donut", label: "Donut" },
];

// Orders by status for the chosen date range — same points feed bars or donut
function StatusBreakdownView() {
  const { orders, isPending, error, refetch } = useOrdersInDateRange();
  const [chartKind, setChartKind] = useState<StatusChartKind>("bars");

  if (isPending) return <AdminLoading label="Loading orders" />;
  if (error) {
    return (
      <AdminError
        error={error}
        fallbackMessage="Failed to load orders"
        onRetry={() => void refetch()}
      />
    );
  }

  const points = toStatusChartPoints(countOrdersByStatus(orders));
  const chartLabel = "Orders per status";

  return (
    <div className="space-y-4">
      <AdminDateRangeFilter
        earliestAllowedDate={SAMPLE_ORDERS_FROM}
        latestAllowedDate={SAMPLE_ORDERS_TO}
      />
      <div role="group" aria-label="Chart type" className="flex flex-wrap gap-2">
        {CHART_KINDS.map(({ id, label }) => {
          const isActive = chartKind === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={isActive}
              onClick={() => setChartKind(id)}
              className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                isActive
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
      {chartKind === "bars" ? (
        <BarChart label={chartLabel} data={points} />
      ) : (
        <DoughnutChart label={chartLabel} data={points} />
      )}
    </div>
  );
}

export default StatusBreakdownView;
