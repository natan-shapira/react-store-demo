import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AdminChartPage from "./AdminChartPage";

describe("AdminChartPage", () => {
  it("should set the page title and focus the heading", () => {
    render(
      <AdminChartPage title="Stock levels" description="Stock per product." source="dummyjson" />
    );

    expect(document.title).toBe("Stock levels | ReactShop");
    expect(screen.getByRole("heading", { level: 1, name: "Stock levels" })).toHaveFocus();
  });

  it("should describe what the chart will show", () => {
    render(
      <AdminChartPage title="Stock levels" description="Stock per product." source="dummyjson" />
    );

    expect(screen.getByText("Stock per product.")).toBeInTheDocument();
  });

  it.each([
    ["dummyjson", "Data from DummyJSON"],
    ["sample", "Sample data until the server is ready"],
  ] as const)("should label %s data as %s", (source, label) => {
    render(<AdminChartPage title="Chart" description="Description" source={source} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("should show a placeholder until the chart is built", () => {
    render(<AdminChartPage title="Chart" description="Description" source="sample" />);

    expect(screen.getByText("Chart coming soon")).toBeInTheDocument();
  });
});
