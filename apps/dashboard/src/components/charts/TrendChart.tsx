import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridRows } from "@visx/grid";
import { Group } from "@visx/group";
import { ParentSize } from "@visx/responsive";
import { scaleLinear, scalePoint } from "@visx/scale";
import { LinePath } from "@visx/shape";
import { useTooltip, TooltipWithBounds } from "@visx/tooltip";
import { VisuallyHidden } from "@pulseboard/ui";
import { localPoint } from "@visx/event";
import type { MouseEvent, TouchEvent } from "react";

import { formatCount } from "../../lib/formatters";
import type { TrendSeries } from "../../features/overview/transforms";

export interface TrendAnomalyBand {
  key: string;
  label: string;
  startDate: string;
  endDate: string;
}

export interface TrendChartProps {
  series: readonly TrendSeries[];
  anomalyBands?: readonly TrendAnomalyBand[];
  height?: number;
  ariaLabel: string;
}

const CHART_MARGIN = { top: 12, right: 12, bottom: 28, left: 44 };

interface TooltipDatum {
  date: string;
  values: { label: string; value: number; swatchClassName: string }[];
}

function shortDateLabel(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00.000Z`);
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

function TrendChartSvg({
  width,
  height,
  series,
  anomalyBands,
  ariaLabel,
}: TrendChartProps & { width: number }) {
  const { tooltipData, tooltipLeft, tooltipTop, showTooltip, hideTooltip } =
    useTooltip<TooltipDatum>();

  const chartHeight = height ?? 280;
  const innerWidth = Math.max(0, width - CHART_MARGIN.left - CHART_MARGIN.right);
  const innerHeight = Math.max(0, chartHeight - CHART_MARGIN.top - CHART_MARGIN.bottom);

  const dates = series[0]?.points.map((point) => point.date) ?? [];
  const dateScale = scalePoint<string>({ domain: dates, range: [0, innerWidth] });
  const largestValue = Math.max(
    1,
    ...series.flatMap((entry) => entry.points.map((point) => point.value)),
  );
  const valueScale = scaleLinear<number>({
    domain: [0, largestValue * 1.08],
    range: [innerHeight, 0],
    nice: true,
  });

  const handleHover = (event: MouseEvent<SVGRectElement> | TouchEvent<SVGRectElement>) => {
    const point = localPoint(event);
    if (point === null || dates.length === 0) {
      return;
    }
    const relativeX = point.x - CHART_MARGIN.left;
    const step = dateScale.step();
    const index = Math.min(dates.length - 1, Math.max(0, Math.round(relativeX / step)));
    const date = dates[index];
    if (date === undefined) {
      return;
    }
    showTooltip({
      tooltipData: {
        date,
        values: series.map((entry) => ({
          label: entry.label,
          value: entry.points[index]?.value ?? 0,
          swatchClassName: entry.swatchClassName,
        })),
      },
      tooltipLeft: (dateScale(date) ?? 0) + CHART_MARGIN.left,
      tooltipTop: point.y,
    });
  };

  return (
    <div className="relative">
      <svg width={width} height={chartHeight} role="img" aria-label={ariaLabel}>
        <Group left={CHART_MARGIN.left} top={CHART_MARGIN.top}>
          <g className="text-outline">
            <GridRows
              scale={valueScale}
              width={innerWidth}
              numTicks={4}
              stroke="currentColor"
              strokeOpacity={0.6}
            />
          </g>
          {(anomalyBands ?? []).map((band) => {
            const bandDates = dates.filter(
              (date) => date >= band.startDate && date <= band.endDate,
            );
            const firstDate = bandDates[0];
            const lastDate = bandDates[bandDates.length - 1];
            if (firstDate === undefined || lastDate === undefined) {
              return null;
            }
            const bandStart = dateScale(firstDate) ?? 0;
            const bandEnd = dateScale(lastDate) ?? 0;
            return (
              <rect
                key={band.key}
                x={bandStart - dateScale.step() / 2}
                y={0}
                width={bandEnd - bandStart + dateScale.step()}
                height={innerHeight}
                className="text-warning"
                fill="currentColor"
                opacity={0.09}
              />
            );
          })}
          {series.map((entry) => (
            <g key={entry.key} className={entry.colorClassName}>
              <LinePath
                data={entry.points}
                x={(point) => dateScale(point.date) ?? 0}
                y={(point) => valueScale(point.value)}
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          ))}
          {tooltipData !== undefined && (
            <line
              x1={dateScale(tooltipData.date) ?? 0}
              x2={dateScale(tooltipData.date) ?? 0}
              y1={0}
              y2={innerHeight}
              className="text-outline-strong"
              stroke="currentColor"
              strokeDasharray="3,3"
            />
          )}
          <g className="numeric-data text-text-muted">
            <AxisLeft
              scale={valueScale}
              numTicks={4}
              stroke="transparent"
              tickStroke="transparent"
              tickLabelProps={{
                fill: "currentColor",
                fontSize: 11,
                fontFamily: "inherit",
                textAnchor: "end",
                dx: -4,
              }}
              tickFormat={(value) => formatCount(Number(value))}
            />
          </g>
          <g className="numeric-data text-text-muted">
            <AxisBottom
              top={innerHeight}
              scale={dateScale}
              numTicks={Math.min(6, dates.length)}
              stroke="currentColor"
              tickStroke="transparent"
              tickLabelProps={{
                fill: "currentColor",
                fontSize: 11,
                fontFamily: "inherit",
                textAnchor: "middle",
              }}
              tickFormat={(date) => shortDateLabel(String(date))}
            />
          </g>
          <rect
            x={0}
            y={0}
            width={innerWidth}
            height={innerHeight}
            fill="transparent"
            onMouseMove={handleHover}
            onTouchMove={handleHover}
            onMouseLeave={hideTooltip}
          />
        </Group>
      </svg>
      {tooltipData !== undefined && (
        <TooltipWithBounds
          left={tooltipLeft}
          top={tooltipTop}
          className="pointer-events-none"
          style={{ position: "absolute" }}
        >
          <div className="rounded-medium border border-outline bg-surface-raised px-2.5 py-1.5 text-xs shadow-overlay">
            <p className="font-medium text-text-primary">{shortDateLabel(tooltipData.date)}</p>
            {tooltipData.values.map((entry) => (
              <p key={entry.label} className="flex items-center gap-1.5 text-text-muted">
                <span
                  aria-hidden
                  className={`inline-block size-2 rounded-full ${entry.swatchClassName}`}
                />
                {entry.label}: <span className="numeric-data">{formatCount(entry.value)}</span>
              </p>
            ))}
          </div>
        </TooltipWithBounds>
      )}
    </div>
  );
}

export function TrendChart(props: TrendChartProps) {
  return (
    <div>
      <div className="flex items-center gap-4 pb-2">
        {props.series.map((entry) => (
          <span key={entry.key} className="flex items-center gap-1.5 text-xs text-text-muted">
            <span
              aria-hidden
              className={`inline-block h-0.5 w-4 rounded-full ${entry.swatchClassName}`}
            />
            {entry.label}
          </span>
        ))}
      </div>
      <div style={{ height: props.height ?? 280 }}>
        <ParentSize>
          {({ width }) => (width > 0 ? <TrendChartSvg {...props} width={width} /> : null)}
        </ParentSize>
      </div>
      <VisuallyHidden>
        <table>
          <caption>{props.ariaLabel}</caption>
          <thead>
            <tr>
              <th>Date</th>
              {props.series.map((entry) => (
                <th key={entry.key}>{entry.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(props.series[0]?.points ?? []).map((point, index) => (
              <tr key={point.date}>
                <td>{point.date}</td>
                {props.series.map((entry) => (
                  <td key={entry.key}>{entry.points[index]?.value ?? 0}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </VisuallyHidden>
    </div>
  );
}
