interface AdminLoadingProps {
  // Read by screen readers, e.g. "Loading order statuses"
  label: string;
}

const BAR_HEIGHTS = ["h-1/3", "h-2/3", "h-1/2", "h-5/6", "h-2/5", "h-3/4", "h-1/2"];

// Stands in for a chart while its data loads; it has the chart's height, so nothing jumps
function AdminLoading({ label }: AdminLoadingProps) {
  return (
    <div
      role="status"
      aria-label={label}
      aria-busy="true"
      className="flex items-end gap-3 h-80 p-6 bg-white rounded-xl border border-gray-200 animate-pulse motion-reduce:animate-none"
    >
      {BAR_HEIGHTS.map((height, i) => (
        <div key={i} className={`flex-1 rounded-t-md bg-gray-200 ${height}`} />
      ))}
    </div>
  );
}

export default AdminLoading;
