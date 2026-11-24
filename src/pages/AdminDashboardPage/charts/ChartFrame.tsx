import type { ReactNode } from "react";

interface ChartFrameProps {
  // Names the chart for screen readers
  label: string;
  isEmpty: boolean;
  children: ReactNode;
}

// Shared shell for admin charts — same footprint when empty or drawn
function ChartFrame({ label, isEmpty, children }: ChartFrameProps) {
  if (isEmpty) {
    return (
      <figure
        aria-label={label}
        className="flex h-80 items-center justify-center rounded-xl border border-gray-200 bg-white p-6 text-gray-500"
      >
        <p>No data to show</p>
      </figure>
    );
  }

  return (
    <figure aria-label={label} className="h-80 rounded-xl border border-gray-200 bg-white p-6">
      {children}
    </figure>
  );
}

export default ChartFrame;
