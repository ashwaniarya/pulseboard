import type { DailyLocationMetrics } from "@pulseboard/mock-api";
import type { KpiDelta } from "@pulseboard/ui";

import {
  formatCount,
  formatCurrencyFromCents,
  formatPercentValue,
  formatRating,
} from "../../lib/formatters";
import type { MetricsTotals } from "./overviewApi";

export type DeltaGoodness = "up-is-good" | "down-is-good";

const FLAT_DELTA_THRESHOLD_PERCENT = 0.5;

export function buildDeltaFromComparison(
  currentValue: number,
  previousValue: number,
  goodness: DeltaGoodness,
): KpiDelta | null {
  if (previousValue === 0) {
    return null;
  }
  const changePercent = ((currentValue - previousValue) / previousValue) * 100;
  const magnitude = Math.abs(changePercent);
  const percentText = `${String(Math.round(magnitude * 10) / 10)}%`;
  if (magnitude < FLAT_DELTA_THRESHOLD_PERCENT) {
    return { percentText, direction: "flat", sentiment: "neutral" };
  }
  const direction = changePercent > 0 ? "up" : "down";
  const isImprovement = goodness === "up-is-good" ? changePercent > 0 : changePercent < 0;
  return { percentText, direction, sentiment: isImprovement ? "positive" : "negative" };
}

export interface KpiTileModel {
  key: string;
  label: string;
  value: string;
  delta: KpiDelta | null;
  sparklineValues: number[];
  downIsGood?: boolean;
}

type DailyRowForSeries = Pick<DailyLocationMetrics, "date"> & Partial<DailyLocationMetrics>;

export function buildDailySeries(
  rows: readonly DailyRowForSeries[],
  readValue: (row: DailyRowForSeries) => number,
): number[] {
  const totalsByDate = new Map<string, number>();
  for (const row of rows) {
    totalsByDate.set(row.date, (totalsByDate.get(row.date) ?? 0) + readValue(row));
  }
  return [...totalsByDate.entries()]
    .sort(([firstDate], [secondDate]) => firstDate.localeCompare(secondDate))
    .map(([, total]) => total);
}

function noShowRatePercent(totals: MetricsTotals): number {
  if (totals.appointmentsBooked === 0) {
    return 0;
  }
  return (totals.appointmentsNoShows / totals.appointmentsBooked) * 100;
}

export function buildKpiTileModels(
  current: MetricsTotals,
  previous: MetricsTotals,
  dailyRows: readonly DailyLocationMetrics[],
): KpiTileModel[] {
  return [
    {
      key: "calls-answered",
      label: "Calls answered",
      value: formatCount(current.callsAnswered),
      delta: buildDeltaFromComparison(current.callsAnswered, previous.callsAnswered, "up-is-good"),
      sparklineValues: buildDailySeries(dailyRows, (row) => row.calls?.answered ?? 0),
    },
    {
      key: "missed-calls",
      label: "Missed calls",
      value: formatCount(current.callsMissed),
      delta: buildDeltaFromComparison(current.callsMissed, previous.callsMissed, "down-is-good"),
      sparklineValues: buildDailySeries(dailyRows, (row) => row.calls?.missed ?? 0),
      downIsGood: true,
    },
    {
      key: "appointments-completed",
      label: "Appointments completed",
      value: formatCount(current.appointmentsCompleted),
      delta: buildDeltaFromComparison(
        current.appointmentsCompleted,
        previous.appointmentsCompleted,
        "up-is-good",
      ),
      sparklineValues: buildDailySeries(dailyRows, (row) => row.appointments?.completed ?? 0),
    },
    {
      key: "no-show-rate",
      label: "No-show rate",
      value: formatPercentValue(noShowRatePercent(current)),
      delta: buildDeltaFromComparison(
        noShowRatePercent(current),
        noShowRatePercent(previous),
        "down-is-good",
      ),
      sparklineValues: buildDailySeries(dailyRows, (row) => row.appointments?.noShows ?? 0),
      downIsGood: true,
    },
    {
      key: "average-rating",
      label: "Avg rating",
      value: formatRating(current.averageRating),
      delta:
        current.averageRating !== null && previous.averageRating !== null
          ? buildDeltaFromComparison(current.averageRating, previous.averageRating, "up-is-good")
          : null,
      sparklineValues: buildDailySeries(dailyRows, (row) => row.reviews?.averageRating ?? 0),
    },
    {
      key: "revenue-collected",
      label: "Revenue collected",
      value: formatCurrencyFromCents(current.revenueCollectedCents),
      delta: buildDeltaFromComparison(
        current.revenueCollectedCents,
        previous.revenueCollectedCents,
        "up-is-good",
      ),
      sparklineValues: buildDailySeries(dailyRows, (row) => row.revenue?.collectedCents ?? 0),
    },
  ];
}

export type TrendMetricFamily = "calls" | "appointments" | "revenue";

export interface TrendPoint {
  date: string;
  value: number;
}

export interface TrendSeries {
  key: string;
  label: string;
  colorVariable: string;
  points: TrendPoint[];
}

export interface TrendChartModel {
  series: TrendSeries[];
}

function seriesFrom(
  rows: readonly DailyRowForSeries[],
  key: string,
  label: string,
  colorVariable: string,
  readValue: (row: DailyRowForSeries) => number,
): TrendSeries {
  const totalsByDate = new Map<string, number>();
  for (const row of rows) {
    totalsByDate.set(row.date, (totalsByDate.get(row.date) ?? 0) + readValue(row));
  }
  const points = [...totalsByDate.entries()]
    .sort(([firstDate], [secondDate]) => firstDate.localeCompare(secondDate))
    .map(([date, value]) => ({ date, value }));
  return { key, label, colorVariable, points };
}

export function buildTrendChartModel(
  rows: readonly DailyLocationMetrics[],
  family: TrendMetricFamily,
): TrendChartModel {
  if (family === "calls") {
    return {
      series: [
        seriesFrom(rows, "answered", "Answered", "--chart-1", (row) => row.calls?.answered ?? 0),
        seriesFrom(rows, "missed", "Missed", "--chart-2", (row) => row.calls?.missed ?? 0),
      ],
    };
  }
  if (family === "appointments") {
    return {
      series: [
        seriesFrom(
          rows,
          "completed",
          "Completed",
          "--chart-1",
          (row) => row.appointments?.completed ?? 0,
        ),
        seriesFrom(
          rows,
          "no-shows",
          "No-shows",
          "--chart-2",
          (row) => row.appointments?.noShows ?? 0,
        ),
      ],
    };
  }
  return {
    series: [
      seriesFrom(
        rows,
        "revenue",
        "Revenue ($)",
        "--chart-1",
        (row) => (row.revenue?.collectedCents ?? 0) / 100,
      ),
    ],
  };
}
