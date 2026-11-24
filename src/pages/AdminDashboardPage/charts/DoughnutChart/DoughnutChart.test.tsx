import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ORDER_STATUS_COLORS } from "../chartTheme";
import DoughnutChart from "./DoughnutChart";

interface MockDoughnutData {
  labels?: unknown[];
  datasets: {
    data: unknown[];
    backgroundColor?: string | string[];
  }[];
}

vi.mock("react-chartjs-2", () => ({
  Doughnut: ({
    data,
    "aria-label": ariaLabel,
  }: {
    data: MockDoughnutData;
    "aria-label"?: string;
  }) => (
    <div role="img" aria-label={ariaLabel} data-testid="doughnut-chart">
      <ul>
        {(data.labels ?? []).map((label, i) => {
          const dataset = data.datasets[0];
          const value = dataset?.data[i];
          const colors = dataset?.backgroundColor;
          const color = Array.isArray(colors) ? String(colors[i]) : String(colors ?? "");
          return (
            <li key={String(label)} data-color={color}>
              {String(label)}: {String(value)}
            </li>
          );
        })}
      </ul>
    </div>
  ),
}));

vi.mock("chart.js", () => ({
  Chart: { register: vi.fn() },
  ArcElement: {},
  Tooltip: {},
  Legend: {},
}));

describe("DoughnutChart", () => {
  it("should be named for screen readers", () => {
    render(
      <DoughnutChart label="Orders per status" data={[{ label: "Pending", value: 3 }]} />
    );

    expect(screen.getByRole("figure", { name: "Orders per status" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Orders per status" })).toBeInTheDocument();
  });

  it("should list each slice with its label and value", () => {
    render(
      <DoughnutChart
        label="Orders per status"
        data={[
          { label: "Pending", value: 2, color: ORDER_STATUS_COLORS.pending },
          { label: "Shipped", value: 4, color: ORDER_STATUS_COLORS.shipped },
        ]}
      />
    );

    expect(screen.getByText("Pending: 2")).toBeInTheDocument();
    expect(screen.getByText("Shipped: 4")).toBeInTheDocument();
  });

  it("should show an empty state when there is no data", () => {
    render(<DoughnutChart label="Orders per status" data={[]} />);

    expect(screen.getByText("No data to show")).toBeInTheDocument();
    expect(screen.queryByTestId("doughnut-chart")).not.toBeInTheDocument();
  });
});
