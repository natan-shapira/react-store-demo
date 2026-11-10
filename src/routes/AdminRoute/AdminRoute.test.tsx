import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import AdminRoute from "./AdminRoute";
import { useAuthStore } from "../../stores/useAuthStore";
import type { User, UserRole } from "../../types";

const user: User = {
  id: 1,
  username: "emilys",
  email: "emily@example.com",
  firstName: "Emily",
  lastName: "Johnson",
};

const signInAs = (role: UserRole | undefined, isLoading = false) =>
  useAuthStore.setState({ token: "test-token", user: { ...user, role }, isLoading });

const renderAdminRoute = () =>
  render(
    <MemoryRouter initialEntries={["/admin"]}>
      <Routes>
        <Route element={<AdminRoute fallback={<h1>Not found</h1>} />}>
          <Route path="/admin" element={<h1>Admin dashboard</h1>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );

describe("AdminRoute", () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, user: null, isLoading: false });
  });

  it("should show the admin page to an admin", () => {
    signInAs("admin");
    renderAdminRoute();

    expect(screen.getByRole("heading", { name: "Admin dashboard" })).toBeInTheDocument();
  });

  it.each<UserRole>(["user", "moderator"])("should show the fallback to a %s", (role) => {
    signInAs(role);
    renderAdminRoute();

    expect(screen.getByRole("heading", { name: "Not found" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Admin dashboard" })).not.toBeInTheDocument();
  });

  it("should show the fallback when the user has no role", () => {
    signInAs(undefined);
    renderAdminRoute();

    expect(screen.getByRole("heading", { name: "Not found" })).toBeInTheDocument();
  });

  it("should show nothing while the role is still loading", () => {
    signInAs(undefined, true);
    renderAdminRoute();

    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("should not wait for loading once the role is known", () => {
    signInAs("admin", true);
    renderAdminRoute();

    expect(screen.getByRole("heading", { name: "Admin dashboard" })).toBeInTheDocument();
  });
});
