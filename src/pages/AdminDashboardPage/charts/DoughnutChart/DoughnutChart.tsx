import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Tooltip,
  type ChartData,
  type ChartOptions,
  type TooltipItem,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import ChartFrame from "../ChartFrame";
import { chartColor } from "../chartTheme";
import { defaultChartFormat, type ChartDataPoint } from "../chartTypes";

ChartJS.register(ArcElement, Tooltip, Legend);

export type { ChartDataPoint as DoughnutChartDataPoint };

export interface DoughnutChartProps {
  data: readonly ChartDataPoint[];
  // Names the chart for screen readers, e.g. "Orders per status"
  label: string;
  formatValue?: (value: number) => string;
}

const toChartData = (data: readonly ChartDataPoint[]): ChartData<"doughnut"> => ({
  labels: data.map((point) => point.label),
  datasets: [
    {
      data: data.map((point) => point.value),
      backgroundColor: data.map((point, i) => point.color ?? chartColor(i)),
      borderWidth: 0,
    },
  ],
});

const toChartOptions = (
  data: readonly ChartDataPoint[],
  formatValue: (value: number) => string
): ChartOptions<"doughnut"> => {
  const total = data.reduce((sum, point) => sum + point.value, 0);

  return {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "62%",
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: "#4b5563",
          boxWidth: 12,
          padding: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (item: TooltipItem<"doughnut">) => {
            const value = Number(item.raw);
            const pct = total === 0 ? 0 : Math.round((value / total) * 100);
            return `${item.label}: ${formatValue(value)} (${pct}%)`;
          },
        },
      },
    },
  };
};

function DoughnutChart({ data, label, formatValue = defaultChartFormat }: DoughnutChartProps) {
  return (
    <ChartFrame label={label} isEmpty={data.length === 0}>
      <Doughnut
        aria-label={label}
        role="img"
        data={toChartData(data)}
        options={toChartOptions(data, formatValue)}
      />
    </ChartFrame>
  );
}

export default DoughnutChart;
