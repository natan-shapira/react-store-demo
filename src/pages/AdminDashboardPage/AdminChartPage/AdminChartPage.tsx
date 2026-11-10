import { BarChart3 } from "lucide-react";
import { usePageMeta } from "../../../hooks/usePageMeta";
import type { AdminDataSource } from "../adminDataSource";

interface AdminChartPageProps {
  title: string;
  // What the chart will show and where its data comes from
  description: string;
  source: AdminDataSource;
}

const sourceLabels: Record<AdminDataSource, string> = {
  dummyjson: "Data from DummyJSON",
  sample: "Sample data until the server is ready",
};

// The shared frame of every admin chart page; the chart itself is not built yet
function AdminChartPage({ title, description, source }: AdminChartPageProps) {
  const headingRef = usePageMeta(title);

  return (
    <section>
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-gray-900">
          {title}
        </h1>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            source === "dummyjson" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"
          }`}
        >
          {sourceLabels[source]}
        </span>
      </div>
      <p className="text-gray-600 mb-6">{description}</p>

      <div className="flex flex-col items-center justify-center gap-2 h-80 rounded-xl border-2 border-dashed border-gray-300 bg-white text-gray-500">
        <BarChart3 className="w-10 h-10" aria-hidden="true" />
        <p>Chart coming soon</p>
      </div>
    </section>
  );
}

export default AdminChartPage;
