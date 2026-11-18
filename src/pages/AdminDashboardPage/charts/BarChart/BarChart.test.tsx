import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ORDER_STATUS_COLORS, chartColor } from "../chartTheme";
import BarChart from "./BarChart";

interface MockBarData {
  labels?: unknown[];
  datasets: {
    data: unknown[];
    backgroundColor?: string | string[];
  }[];
}

// Chart.js draws on a canvas; the mock turns the data into a list so the tests can read it
vi.mock("react-chartjs-2", () => ({
  Bar: ({ data, "aria-label": ariaLabel }: { data: MockBarData; "aria-label"?: string }) => (
    <div role="img" aria-label={ariaLabel} data-testid="bar-chart">
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
  CategoryScale: {},
  LinearScale: {},
  BarElement: {},
  Tooltip: {},
  Legend: {},
}));

describe("BarChart", () => {
  it("should be named for screen readers", () => {
    render(<BarChart label="Orders per status" data={[{ label: "Pending", value: 3 }]} />);

    expect(screen.getByRole("figure", { name: "Orders per status" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Orders per status" })).toBeInTheDocument();
  });

  it("should pass each bar's label and value to Chart.js", () => {
    render(
      <BarChart
        label="Orders per status"
        data={[
          { label: "Pending", value: 38 },
          { label: "Delivered", value: 1412 },
        ]}
      />
    );

    expect(screen.getByText("Pending: 38")).toBeInTheDocument();
    expect(screen.getByText("Delivered: 1412")).toBeInTheDocument();
  });

  it("should use a bar's own color, or the palette's when it has none", () => {
    render(
      <BarChart
        label="Chart"
        data={[
          { label: "Cancelled", value: 1, color: ORDER_STATUS_COLORS.cancelled },
          { label: "Other", value: 1 },
        ]}
      />
    );

    expect(screen.getByText("Cancelled: 1")).toHaveAttribute(
      "data-color",
      ORDER_STATUS_COLORS.cancelled
    );
    expect(screen.getByText("Other: 1")).toHaveAttribute("data-color", chartColor(1));
  });

  it("should render when a value formatter is passed", () => {
    render(
      <BarChart
        label="Revenue"
        data={[{ label: "March", value: 19610 }]}
        formatValue={(value) => `$${value}`}
      />
    );

    expect(screen.getByRole("img", { name: "Revenue" })).toBeInTheDocument();
    expect(screen.getByText("March: 19610")).toBeInTheDocument();
  });

  it("should say so when there is no data", () => {
    render(<BarChart label="Chart" data={[]} />);

    expect(screen.getByText("No data to show")).toBeInTheDocument();
    expect(screen.queryByTestId("bar-chart")).not.toBeInTheDocument();
  });
});
