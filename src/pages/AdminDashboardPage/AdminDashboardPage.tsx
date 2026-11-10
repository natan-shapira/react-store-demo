import { Suspense } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { ADMIN_SECTIONS } from "./adminSections";
import type { AdminDataSource } from "./adminDataSource";

const groups: { source: AdminDataSource; label: string }[] = [
  { source: "dummyjson", label: "From DummyJSON" },
  { source: "sample", label: "Sample data" },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block px-3 py-2 rounded-md text-sm transition-colors ${
    isActive ? "bg-blue-600 text-white font-medium" : "text-gray-700 hover:bg-gray-100"
  }`;

// The admin area's layout: the section menu stays in place, and the chosen section is rendered
// by <Outlet /> from the nested routes in App.tsx
function AdminDashboardPage() {
  return (
    <div className="lg:grid lg:grid-cols-[14rem_1fr] lg:gap-8">
      <nav aria-label="Admin sections" className="mb-8 lg:mb-0 space-y-6">
        <NavLink to="/admin" end className={linkClass}>
          Overview
        </NavLink>

        {groups.map(({ source, label }) => (
          <div key={source}>
            {/* A labelled list rather than a heading, so the page's h1 stays the first heading */}
            <p
              id={`admin-group-${source}`}
              className="px-3 mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500"
            >
              {label}
            </p>
            <ul aria-labelledby={`admin-group-${source}`} className="space-y-1">
              {ADMIN_SECTIONS.filter((section) => section.source === source).map((section) => (
                <li key={section.path}>
                  <NavLink to={section.path} className={linkClass}>
                    {section.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Sections load on demand; the menu stays on screen meanwhile */}
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
    </div>
  );
}

export default AdminDashboardPage;
