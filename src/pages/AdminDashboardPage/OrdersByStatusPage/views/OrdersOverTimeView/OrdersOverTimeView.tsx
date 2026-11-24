import { useMemo, useState } from "react";
import { SAMPLE_ORDERS_FROM, SAMPLE_ORDERS_TO } from "../../../../../api/adminSampleData";
import { ORDER_STATUSES_WITH_ALL, type OrderStatusWithAll } from "../../../../../api/adminTypes";
import { ORDER_STATUS_LABELS_WITH_ALL } from "../../../charts/chartTheme";
import LineChart from "../../../charts/LineChart/LineChart";
import AdminDateRangeFilter from "../../../components/AdminDateRangeFilter/AdminDateRangeFilter";
import AdminError from "../../../components/AdminError/AdminError";
import AdminLoading from "../../../components/AdminLoading/AdminLoading";
import EmptyLineChart from "../../../charts/LineChart/EmptyLineChart";
import { countOrdersByDayAndStatus } from "../../../statsTransforms";
import { getDefined } from "../../../statusRecords";
import useOrdersInDateRange from "../../useOrdersInDateRange";

// Number of orders over time for the chosen date range, one line per status
function OrdersOverTimeView() {
  const { orders, isPending, error, refetch } = useOrdersInDateRange();
  const [selectedStatuses, setSelectedStatuses] = useState<Set<OrderStatusWithAll>>(
    () => new Set<OrderStatusWithAll>(ORDER_STATUSES_WITH_ALL)
  );

  const handleToggleStatus = (status: OrderStatusWithAll) => {
    setSelectedStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  };

  const points = useMemo(() => countOrdersByDayAndStatus(orders), [orders]);

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

  return (
    <div className="space-y-4">
      <AdminDateRangeFilter
        earliestAllowedDate={SAMPLE_ORDERS_FROM}
        latestAllowedDate={SAMPLE_ORDERS_TO}
      />
      <fieldset className="flex flex-wrap gap-4">
        <legend className="sr-only">Statuses to show</legend>
        {ORDER_STATUSES_WITH_ALL.map((status) => (
          <label
            key={status}
            className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedStatuses.has(status)}
              onChange={() => handleToggleStatus(status)}
              className="w-4 h-4 accent-blue-600 cursor-pointer"
            />
            {getDefined(ORDER_STATUS_LABELS_WITH_ALL, status)}
          </label>
        ))}
      </fieldset>
      {selectedStatuses.size ? (
        <LineChart label="Orders over time" data={points} visibleStatuses={selectedStatuses} />
      ) : (
        <EmptyLineChart
          label="Orders over time"
          title="No statuses selected"
          description="Select at least one status above to show the orders-over-time chart."
        />
      )}
    </div>
  );
}

export default OrdersOverTimeView;
