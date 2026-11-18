import type { ReactNode } from "react";
import { usePageMeta } from "../../../hooks/usePageMeta";
import type { AdminDataSource } from "../adminDataSource";
import AdminChartPlaceholder from "../components/AdminChartPlaceholder/AdminChartPlaceholder";

interface AdminChartPageProps {
  title: string;
  // What the chart will show and where its data comes from
  description: string;
  source: AdminDataSource;
  children?: ReactNode;
}

const sourceLabels: Record<AdminDataSource, string> = {
  dummyjson: "Data from DummyJSON",
  sample: "Sample data until the server is ready",
};

// The shared frame of every admin chart page: heading, data source and description, then the
// page's own content, or a placeholder while the page has none
function AdminChartPage({ title, description, source, children }: AdminChartPageProps) {
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

      {children ?? <AdminChartPlaceholder />}
    </section>
  );
}

export default AdminChartPage;
