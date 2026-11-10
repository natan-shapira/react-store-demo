import { ShieldCheck } from "lucide-react";
import { usePageMeta } from "../../../hooks/usePageMeta";

// Shown at /admin itself, before a chart is chosen
function AdminOverviewPage() {
  const headingRef = usePageMeta("Admin dashboard");

  return (
    <section className="flex flex-col items-center justify-center text-center py-16">
      <ShieldCheck className="w-16 h-16 text-blue-600 mb-4" aria-hidden="true" />
      <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-gray-900 mb-2">
        Admin dashboard
      </h1>
      <p className="text-gray-600 max-w-md">
        Choose a chart from the menu. Charts under “From DummyJSON” will use live data; the ones
        under “Sample data” will use made-up numbers until the project has its own server.
      </p>
    </section>
  );
}

export default AdminOverviewPage;
