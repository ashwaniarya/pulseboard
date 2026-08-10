import { AxisBottom } from "@visx/axis";
import { Group } from "@visx/group";
import { ParentSize } from "@visx/responsive";
import { scaleBand, scaleLinear } from "@visx/scale";

import { formatCount } from "../../lib/formatters";

export interface ComparisonBarDatum {
  groupLabel: string;
  values: { label: string; value: number; colorClassName: string; swatchClassName: string }[];
}

export interface ComparisonBarChartProps {
  data: readonly ComparisonBarDatum[];
  height?: number;
  ariaLabel: string;
}

const MARGIN = { top: 20, right: 8, bottom: 40, left: 8 };

function ComparisonBarsSvg({
  data,
  height,
  ariaLabel,
  width,
}: ComparisonBarChartProps & { width: number }) {
  const chartHeight = height ?? 260;
  const innerWidth = Math.max(0, width - MARGIN.left - MARGIN.right);
  const innerHeight = Math.max(0, chartHeight - MARGIN.top - MARGIN.bottom);

  const groupScale = scaleBand<string>({
    domain: data.map((datum) => datum.groupLabel),
    range: [0, innerWidth],
    padding: 0.25,
  });
  const seriesLabels = data[0]?.values.map((value) => value.label) ?? [];
  const barScale = scaleBand<string>({
    domain: seriesLabels,
    range: [0, groupScale.bandwidth()],
    padding: 0.15,
  });
  const largestValue = Math.max(
    1,
    ...data.flatMap((datum) => datum.values.map((value) => value.value)),
  );
  const valueScale = scaleLinear<number>({
    domain: [0, largestValue * 1.15],
    range: [innerHeight, 0],
  });

  return (
    <svg width={width} height={chartHeight} role="img" aria-label={ariaLabel}>
      <Group left={MARGIN.left} top={MARGIN.top}>
        {data.map((datum) => (
          <Group key={datum.groupLabel} left={groupScale(datum.groupLabel) ?? 0}>
            {datum.values.map((value) => {
              const barHeight = innerHeight - valueScale(value.value);
              const barX = barScale(value.label) ?? 0;
              const barWidth = barScale.bandwidth();
              return (
                <Group key={value.label}>
                  <rect
                    x={barX}
                    y={valueScale(value.value)}
                    width={barWidth}
                    height={Math.max(0, barHeight - 2)}
                    rx={4}
                    className={value.colorClassName}
                    fill="currentColor"
                  />
                  <text
                    x={barX + barWidth / 2}
                    y={valueScale(value.value) - 6}
                    textAnchor="middle"
                    className="numeric-data text-text-muted"
                    fill="currentColor"
                    fontSize={10}
                  >
                    {formatCount(value.value)}
                  </text>
                </Group>
              );
            })}
          </Group>
        ))}
        <g className="text-text-muted">
          <AxisBottom
            top={innerHeight}
            scale={groupScale}
            tickStroke="transparent"
            hideAxisLine
            tickLabelProps={{
              fill: "currentColor",
              fontSize: 11,
              textAnchor: "middle",
              width: groupScale.bandwidth(),
              verticalAnchor: "start",
            }}
          />
        </g>
      </Group>
    </svg>
  );
}

export function ComparisonBarChart(props: ComparisonBarChartProps) {
  const seriesLabels = props.data[0]?.values ?? [];
  return (
    <div>
      <div className="flex items-center gap-4 pb-2">
        {seriesLabels.map((value) => (
          <span key={value.label} className="flex items-center gap-1.5 text-xs text-text-muted">
            <span
              aria-hidden
              className={`inline-block size-2.5 rounded-small ${value.swatchClassName}`}
            />
            {value.label}
          </span>
        ))}
      </div>
      <div style={{ height: props.height ?? 260 }}>
        <ParentSize>
          {({ width }) => (width > 0 ? <ComparisonBarsSvg {...props} width={width} /> : null)}
        </ParentSize>
      </div>
    </div>
  );
}
