import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import AdminDashboardPage from "./AdminDashboardPage";
import { ADMIN_SECTIONS } from "./adminSections";

// Stand-ins for the section pages, so the test checks the layout and not the pages
const renderAdminAt = (path: string) => {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin" element={<AdminDashboardPage />}>
          <Route index element={<h1>Overview content</h1>} />
          <Route path="stock" element={<h1>Stock content</h1>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
  return { user };
};

const getMenu = () => screen.getByRole("navigation", { name: "Admin sections" });

describe("AdminDashboardPage", () => {
  describe("Menu", () => {
    it("should list every DummyJSON section under its group", () => {
      renderAdminAt("/admin");

      const group = within(getMenu()).getByRole("list", { name: "From DummyJSON" });
      const expected = ADMIN_SECTIONS.filter((section) => section.source === "dummyjson");
      expect(
        within(group)
          .getAllByRole("link")
          .map((link) => link.textContent)
      ).toEqual(expected.map((section) => section.label));
    });

    it("should list every sample data section under its group", () => {
      renderAdminAt("/admin");

      const group = within(getMenu()).getByRole("list", { name: "Sample data" });
      const expected = ADMIN_SECTIONS.filter((section) => section.source === "sample");
      expect(
        within(group)
          .getAllByRole("link")
          .map((link) => link.textContent)
      ).toEqual(expected.map((section) => section.label));
    });

    it.each(ADMIN_SECTIONS)("should link $label to /admin/$path", ({ label, path }) => {
      renderAdminAt("/admin");

      expect(within(getMenu()).getByRole("link", { name: label })).toHaveAttribute(
        "href",
        `/admin/${path}`
      );
    });
  });

  describe("Outlet", () => {
    it("should show the overview at /admin and mark it as the current page", () => {
      renderAdminAt("/admin");

      expect(screen.getByRole("heading", { name: "Overview content" })).toBeInTheDocument();
      expect(within(getMenu()).getByRole("link", { name: "Overview" })).toHaveAttribute(
        "aria-current",
        "page"
      );
    });

    it("should show the chosen section and mark only it as the current page", () => {
      renderAdminAt("/admin/stock");

      expect(screen.getByRole("heading", { name: "Stock content" })).toBeInTheDocument();
      expect(within(getMenu()).getByRole("link", { name: "Stock levels" })).toHaveAttribute(
        "aria-current",
        "page"
      );
      expect(within(getMenu()).getByRole("link", { name: "Overview" })).not.toHaveAttribute(
        "aria-current"
      );
    });

    it("should keep the menu and swap the section when a link is clicked", async () => {
      const { user } = renderAdminAt("/admin");

      await user.click(within(getMenu()).getByRole("link", { name: "Stock levels" }));

      expect(screen.getByRole("heading", { name: "Stock content" })).toBeInTheDocument();
      expect(screen.queryByRole("heading", { name: "Overview content" })).not.toBeInTheDocument();
      expect(getMenu()).toBeInTheDocument();
    });
  });
});
