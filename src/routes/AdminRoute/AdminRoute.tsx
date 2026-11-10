import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";

interface AdminRouteProps {
  // Shown instead of the admin pages to everyone else
  fallback: ReactNode;
}

// Must sit inside ProtectedRoute, which already sends guests to the sign in page.
// This only decides what the interface shows: the server has to check the role again on every
// admin request, because anything running in the browser can be changed by the user.
function AdminRoute({ fallback }: AdminRouteProps) {
  const role = useAuthStore((state) => state.user?.role);
  const isLoading = useAuthStore((state) => state.isLoading);

  // Right after signing in, the role is still on its way from /auth/me
  if (role === undefined && isLoading) return null;

  return role === "admin" ? <Outlet /> : fallback;
}

export default AdminRoute;
