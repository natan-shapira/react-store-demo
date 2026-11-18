import { BarChart3 } from "lucide-react";

interface AdminChartPlaceholderProps {
  label?: string;
}

// Holds a chart's place until the chart is built
function AdminChartPlaceholder({ label = "Chart coming soon" }: AdminChartPlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 h-80 rounded-xl border-2 border-dashed border-gray-300 bg-white text-gray-500">
      <BarChart3 className="w-10 h-10" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export default AdminChartPlaceholder;
