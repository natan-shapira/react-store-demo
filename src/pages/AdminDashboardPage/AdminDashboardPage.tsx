import { ShieldCheck } from "lucide-react";
import { usePageMeta } from "../../hooks/usePageMeta";

function AdminDashboardPage() {
  const headingRef = usePageMeta("Admin dashboard");

  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <ShieldCheck className="w-16 h-16 text-blue-600 mb-4" aria-hidden="true" />
      <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-gray-900 mb-2">
        Admin dashboard
      </h1>
      <p className="text-gray-500 max-w-md">Admin tools are coming soon.</p>
    </div>
  );
}

export default AdminDashboardPage;
