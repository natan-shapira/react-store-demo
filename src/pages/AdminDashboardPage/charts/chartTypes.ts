import type { ChartColor } from "./chartTheme";

// Shared by bar and doughnut charts (and status transforms)
export interface ChartDataPoint {
  label: string;
  value: number;
  // Leave out for series with no color of their own; the chart then takes chartColor(index)
  color?: ChartColor;
}

export const defaultChartFormat = (value: number) => value.toLocaleString("en-US");
