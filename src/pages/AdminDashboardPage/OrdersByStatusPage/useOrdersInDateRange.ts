import { useSampleOrders } from "../../../api/adminApi";
import { SAMPLE_ORDERS_FROM, SAMPLE_ORDERS_TO } from "../../../api/adminSampleData";
import useAdminDateRange from "../components/AdminDateRangeFilter/useAdminDateRange";
import { filterByDateRange } from "../statsTransforms";

function useOrdersInDateRange() {
  const { data: orders, isPending, error, refetch } = useSampleOrders();
  const { selection } = useAdminDateRange({
    earliestAllowedDate: SAMPLE_ORDERS_FROM,
    latestAllowedDate: SAMPLE_ORDERS_TO,
  });
  const inRangeOrders = orders ? filterByDateRange(orders, selection) : [];
  return {
    orders: inRangeOrders,
    isPending,
    error,
    refetch,
    selection,
  };
}
export default useOrdersInDateRange;
