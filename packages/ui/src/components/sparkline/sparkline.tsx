import { classNames } from "../../lib/class-names";

export const SPARKLINE_VIEWBOX_WIDTH = 120;
export const SPARKLINE_VIEWBOX_HEIGHT = 36;
const STROKE_PADDING = 2;

export function buildSparklinePath(
  values: readonly number[],
  width = SPARKLINE_VIEWBOX_WIDTH,
  height = SPARKLINE_VIEWBOX_HEIGHT,
): string {
  if (values.length < 2) {
    return "";
  }
  const smallest = Math.min(...values);
  const largest = Math.max(...values);
  const valueSpan = largest - smallest;
  const usableHeight = height - STROKE_PADDING * 2;
  const stepWidth = width / (values.length - 1);
  return values
    .map((value, index) => {
      const normalized = valueSpan === 0 ? 0.5 : (value - smallest) / valueSpan;
      const x = index * stepWidth;
      const y = STROKE_PADDING + (1 - normalized) * usableHeight;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

export interface SparklineProps {
  values: readonly number[];
  className?: string;
}

export function Sparkline({ values, className }: SparklineProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${String(SPARKLINE_VIEWBOX_WIDTH)} ${String(SPARKLINE_VIEWBOX_HEIGHT)}`}
      preserveAspectRatio="none"
      className={classNames("h-9 w-full text-chart-1", className)}
      fill="none"
    >
      <path
        d={buildSparklinePath(values)}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
