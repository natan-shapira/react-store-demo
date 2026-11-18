import { Link } from "react-router-dom";
import { VIEW_PARAM, type AdminView } from "./useAdminView";

interface AdminViewNavProps {
  // Names the navigation for screen readers, e.g. "Order views"
  label: string;
  views: readonly Pick<AdminView, "id" | "label">[];
  activeId: string;
}

// Switches between a section page's views. Links rather than tabs: each view has its own address,
// and the section stays the same page, so the heading keeps focus and the title stays.
function AdminViewNav({ label, views, activeId }: AdminViewNavProps) {
  return (
    <nav aria-label={label} className="mb-6 border-b border-gray-200">
      <ul className="flex flex-wrap gap-1 -mb-px">
        {views.map(({ id, label: viewLabel }) => {
          const isActive = id === activeId;
          return (
            <li key={id}>
              <Link
                to={{ search: `?${VIEW_PARAM}=${id}` }}
                aria-current={isActive ? "page" : undefined}
                className={`block px-4 py-2 text-sm border-b-2 transition-colors ${
                  isActive
                    ? "border-blue-600 text-blue-700 font-medium"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                {viewLabel}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default AdminViewNav;
