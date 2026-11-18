import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
  type ChartData,
  type ChartOptions,
  type TooltipItem,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { chartColor, type ChartColor } from "../chartTheme";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export interface BarChartDataPoint {
  label: string;
  value: number;
  // Leave out for series with no color of their own; the bar then takes chartColor(index)
  color?: ChartColor;
}

export interface BarChartProps {
  data: readonly BarChartDataPoint[];
  // Names the chart for screen readers, e.g. "Orders per status"
  label: string;
  formatValue?: (value: number) => string;
}

const defaultFormat = (value: number) => value.toLocaleString("en-US");

// Turns the generic bar points into what Chart.js expects; kept here so pages and transforms
// never import Chart.js
const toChartData = (data: readonly BarChartDataPoint[]): ChartData<"bar"> => ({
  labels: data.map((point) => point.label),
  datasets: [
    {
      data: data.map((point) => point.value),
      backgroundColor: data.map((point, i) => point.color ?? chartColor(i)),
      borderRadius: 6,
      maxBarThickness: 64,
    },
  ],
});

const toChartOptions = (formatValue: (value: number) => string): ChartOptions<"bar"> => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (item: TooltipItem<"bar">) => formatValue(Number(item.raw)),
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: "#4b5563" },
    },
    y: {
      beginAtZero: true,
      ticks: {
        color: "#4b5563",
        callback: (value) => formatValue(Number(value)),
      },
    },
  },
});

// Generic vertical bar chart: receives data already shaped for it and only draws it
function BarChart({ data, label, formatValue = defaultFormat }: BarChartProps) {
  if (data.length === 0) {
    return (
      <figure
        aria-label={label}
        className="flex items-center justify-center h-80 p-6 bg-white rounded-xl border border-gray-200 text-gray-500"
      >
        <p>No data to show</p>
      </figure>
    );
  }

  return (
    <figure aria-label={label} className="h-80 p-6 bg-white rounded-xl border border-gray-200">
      <Bar
        aria-label={label}
        role="img"
        data={toChartData(data)}
        options={toChartOptions(formatValue)}
      />
    </figure>
  );
}

export default BarChart;
