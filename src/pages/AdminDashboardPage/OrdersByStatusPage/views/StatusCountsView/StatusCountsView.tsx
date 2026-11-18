import { useSampleOrders } from "../../../../../api/adminApi";
import { SAMPLE_ORDERS_FROM, SAMPLE_ORDERS_TO } from "../../../../../api/adminSampleData";
import BarChart from "../../../charts/BarChart/BarChart";
import AdminDateRangeFilter from "../../../components/AdminDateRangeFilter/AdminDateRangeFilter";
import { useAdminDateRange } from "../../../components/AdminDateRangeFilter/useAdminDateRange";
import AdminError from "../../../components/AdminError/AdminError";
import AdminLoading from "../../../components/AdminLoading/AdminLoading";
import { countOrdersByStatus, filterByDateRange, toStatusBars } from "../../../statsTransforms";

// Number of orders in each status, one bar per status, for the chosen date range
function StatusCountsView() {
  const { data: orders, isPending, error, refetch } = useSampleOrders();
  const { selection } = useAdminDateRange({
    earliestAllowedDate: SAMPLE_ORDERS_FROM,
    latestAllowedDate: SAMPLE_ORDERS_TO,
  });

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

  const inRange = filterByDateRange(orders, selection);
  const bars = toStatusBars(countOrdersByStatus(inRange));

  return (
    <div className="space-y-4">
      <AdminDateRangeFilter
        earliestAllowedDate={SAMPLE_ORDERS_FROM}
        latestAllowedDate={SAMPLE_ORDERS_TO}
      />
      <BarChart label="Orders per status" data={bars} />
    </div>
  );
}

export default StatusCountsView;
