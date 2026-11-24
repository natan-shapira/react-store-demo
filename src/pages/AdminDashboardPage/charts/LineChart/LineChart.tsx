import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
  type TooltipItem,
} from "chart.js";
import { Line } from "react-chartjs-2";
import {
  ORDER_STATUSES,
  ORDER_STATUSES_WITH_ALL,
  type OrderStatus,
  type OrderStatusWithAll,
} from "../../../../api/adminTypes";
import { ORDER_STATUS_LABELS_WITH_ALL, SERIES_COLORS_WITH_ALL } from "../chartTheme";
import { getDefined, mapKeysToRecord } from "../../statusRecords";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend);

export interface LineChartStatusPoint {
  label: string;
  values: Record<OrderStatus, number>;
}

export interface LineChartProps {
  data: readonly LineChartStatusPoint[];
  // Names the chart for screen readers, e.g. "Orders over time"
  label: string;
  formatValue?: (value: number) => string;
  visibleStatuses: ReadonlySet<OrderStatusWithAll>;
}

const defaultFormat = (value: number) => value.toLocaleString("en-US");

const statusLine = (
  label: string,
  color: string,
  values: number[],
  { borderWidth, pointRadius }: { borderWidth: number; pointRadius: number }
) => ({
  label,
  data: values,
  borderColor: color,
  backgroundColor: color,
  tension: 0.25,
  borderWidth,
  pointRadius,
});

// labels[i] aligns with data[i] on every series; All is the sum of the four statuses
const toChartData = (
  data: readonly LineChartStatusPoint[],
  visibleStatuses: ReadonlySet<OrderStatusWithAll>
): ChartData<"line"> => {
  const labels: string[] = [];
  const seriesValues = mapKeysToRecord(ORDER_STATUSES_WITH_ALL, () => [] as number[]);

  for (const point of data) {
    labels.push(point.label);

    let dayTotal = 0;
    for (const status of ORDER_STATUSES) {
      const count = getDefined(point.values, status);
      getDefined(seriesValues, status).push(count);
      dayTotal += count;
    }
    seriesValues.all.push(dayTotal);
  }

  return {
    labels,
    datasets: ORDER_STATUSES_WITH_ALL.filter((status) => visibleStatuses.has(status)).map((key) =>
      statusLine(
        getDefined(ORDER_STATUS_LABELS_WITH_ALL, key),
        getDefined(SERIES_COLORS_WITH_ALL, key),
        getDefined(seriesValues, key),
        key === "all" ? { borderWidth: 4, pointRadius: 4 } : { borderWidth: 2, pointRadius: 2 }
      )
    ),
  };
};

const toChartOptions = (formatValue: (value: number) => string): ChartOptions<"line"> => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: "index",
    intersect: false,
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      mode: "index",
      intersect: false,
      callbacks: {
        label: (item: TooltipItem<"line">) =>
          `${item.dataset.label ?? ""}: ${formatValue(Number(item.raw))}`,
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

function LineChart({ data, label, formatValue = defaultFormat, visibleStatuses }: LineChartProps) {
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
      <Line
        aria-label={label}
        role="img"
        data={toChartData(data, visibleStatuses)}
        options={toChartOptions(formatValue)}
      />
    </figure>
  );
}

export default LineChart;
