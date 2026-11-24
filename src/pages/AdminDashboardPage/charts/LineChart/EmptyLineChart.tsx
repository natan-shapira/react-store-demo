interface EmptyLineChartProps {
  // Names the placeholder for screen readers, e.g. "Orders over time"
  label: string;
  title: string;
  description: string;
}

// Same footprint as LineChart; empty state when there is nothing to draw
function EmptyLineChart({ label, title, description }: EmptyLineChartProps) {
  return (
    <figure
      aria-label={label}
      className="relative flex h-80 flex-col justify-center overflow-hidden rounded-xl border border-gray-200 bg-white p-6"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 400 200"
        className="absolute inset-6 h-[calc(100%-3rem)] w-[calc(100%-3rem)] text-gray-200"
        preserveAspectRatio="none"
      >
        <line x1="32" y1="16" x2="32" y2="168" stroke="currentColor" strokeWidth="2" />
        <line x1="32" y1="168" x2="384" y2="168" stroke="currentColor" strokeWidth="2" />
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points="48,120 100,88 152,132 204,72 256,108 308,56 360,96"
        />
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.55"
          points="48,140 100,128 152,148 204,116 256,136 308,104 360,124"
        />
      </svg>

      <div className="relative z-10 mx-auto max-w-sm rounded-lg bg-white/90 px-4 py-3 text-center shadow-sm ring-1 ring-gray-200">
        <p className="text-sm font-medium text-gray-800">{title}</p>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
    </figure>
  );
}

export default EmptyLineChart;
