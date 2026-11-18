import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import OrdersByStatusPage from "./OrdersByStatusPage";
import { ORDER_VIEWS } from "./orderViews";

// The page test checks navigation, not Chart.js drawing on a canvas
vi.mock("../charts/BarChart/BarChart", () => ({
  default: ({ label }: { label: string }) => <div role="img" aria-label={label} />,
}));

// The views fetch their own data, so the page needs a query client
const renderPageAt = (path: string) => {
  const user = userEvent.setup();
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <OrdersByStatusPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
  return { user };
};

const getViewNav = () => screen.getByRole("navigation", { name: "Order views" });

describe("OrdersByStatusPage", () => {
  it("should list every view in menu order", () => {
    renderPageAt("/admin/orders");

    expect(
      within(getViewNav())
        .getAllByRole("link")
        .map((link) => link.textContent)
    ).toEqual(ORDER_VIEWS.map((view) => view.label));
  });

  it.each(ORDER_VIEWS)("should link $label to ?view=$id", ({ label, id }) => {
    renderPageAt("/admin/orders");

    expect(within(getViewNav()).getByRole("link", { name: label })).toHaveAttribute(
      "href",
      `/admin/orders?view=${id}`
    );
  });

  it("should show the first view when none is chosen", () => {
    renderPageAt("/admin/orders");

    expect(within(getViewNav()).getByRole("link", { name: "Per status" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("status", { name: "Loading orders" })).toBeInTheDocument();
  });

  it("should show the first view when the address names an unknown one", () => {
    renderPageAt("/admin/orders?view=unknown");

    expect(screen.getByRole("status", { name: "Loading orders" })).toBeInTheDocument();
  });
  it("should show the view named in the address", () => {
    renderPageAt("/admin/orders?view=table");

    expect(within(getViewNav()).getByRole("link", { name: "Orders table" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByText("Orders table coming soon")).toBeInTheDocument();
  });

  it("should swap the view and mark only it as current when a link is clicked", async () => {
    const { user } = renderPageAt("/admin/orders?view=table");

    await user.click(within(getViewNav()).getByRole("link", { name: "Over time" }));

    expect(screen.getByText("Orders over time chart coming soon")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Filters" })).toBeInTheDocument();
    expect(screen.queryByText("Orders table coming soon")).not.toBeInTheDocument();
    expect(within(getViewNav()).getByRole("link", { name: "Orders table" })).not.toHaveAttribute(
      "aria-current"
    );
  });
});
