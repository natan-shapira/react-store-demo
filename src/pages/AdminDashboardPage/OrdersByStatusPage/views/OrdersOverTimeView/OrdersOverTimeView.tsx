import AdminChartPlaceholder from "../../../components/AdminChartPlaceholder/AdminChartPlaceholder";

// Number of orders over time, narrowed by filters: a date range, grouping by day, week or month,
// and which statuses to count
function OrdersOverTimeView() {
  return (
    <div className="space-y-4">
      <div
        role="group"
        aria-label="Filters"
        className="flex items-center h-16 px-4 rounded-xl border-2 border-dashed border-gray-300 bg-white text-sm text-gray-500"
      >
        Filters coming soon
      </div>
      <AdminChartPlaceholder label="Orders over time chart coming soon" />
    </div>
  );
}

export default OrdersOverTimeView;
