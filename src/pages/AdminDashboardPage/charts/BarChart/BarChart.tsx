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
import ChartFrame from "../ChartFrame";
import { chartColor } from "../chartTheme";
import { defaultChartFormat, type ChartDataPoint } from "../chartTypes";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export type { ChartDataPoint as BarChartDataPoint };

export interface BarChartProps {
  data: readonly ChartDataPoint[];
  // Names the chart for screen readers, e.g. "Orders per status"
  label: string;
  formatValue?: (value: number) => string;
}

const toChartData = (data: readonly ChartDataPoint[]): ChartData<"bar"> => ({
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

function BarChart({ data, label, formatValue = defaultChartFormat }: BarChartProps) {
  return (
    <ChartFrame label={label} isEmpty={data.length === 0}>
      <Bar
        aria-label={label}
        role="img"
        data={toChartData(data)}
        options={toChartOptions(formatValue)}
      />
    </ChartFrame>
  );
}

export default BarChart;
