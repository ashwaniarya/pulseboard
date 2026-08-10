import { http, HttpResponse } from "msw";

import type { DailyLocationMetrics, LocationId } from "../domain";
import { getActiveDataset } from "../data/dataset";
import { daysBetween, shiftIsoDate } from "../data/dateMath";
import { applyScenarioDelay, maybeScenarioFailure } from "../scenarios";
import { computeMetricsTotals } from "./shared/computeMetricsTotals";
import {
  parseDateRangeParams,
  parseLocationIdsParam,
  problemResponseFor,
  type DateRangeParams,
} from "./shared/parseQuery";

function filterMetricsRows(
  rows: readonly DailyLocationMetrics[],
  range: DateRangeParams,
  locationIds: readonly LocationId[],
): DailyLocationMetrics[] {
  const locationFilter = locationIds.length === 0 ? null : new Set(locationIds);
  return rows.filter(
    (row) =>
      row.date >= range.startDate &&
      row.date <= range.endDate &&
      (locationFilter === null || locationFilter.has(row.locationId)),
  );
}

function parseMetricsRequest(requestUrl: string) {
  const url = new URL(requestUrl);
  const dataset = getActiveDataset();
  const rangeResult = parseDateRangeParams(url);
  if (!rangeResult.ok) {
    return { error: problemResponseFor(rangeResult) } as const;
  }
  const validIds = new Set(dataset.locations.map((location) => location.id));
  const locationIdsResult = parseLocationIdsParam(url, validIds);
  if (!locationIdsResult.ok) {
    return { error: problemResponseFor(locationIdsResult) } as const;
  }
  return {
    dataset,
    range: rangeResult.value,
    locationIds: locationIdsResult.value,
  } as const;
}

export function previousPeriodOf(range: DateRangeParams): DateRangeParams {
  const dayCount = daysBetween(range.startDate, range.endDate) + 1;
  const endDate = shiftIsoDate(range.startDate, -1);
  return { startDate: shiftIsoDate(endDate, -(dayCount - 1)), endDate };
}

export const metricsHandlers = [
  http.get("*/api/v1/metrics/daily", async ({ request }) => {
    await applyScenarioDelay();
    const failure = maybeScenarioFailure("metrics");
    if (failure !== null) {
      return failure;
    }
    const parsed = parseMetricsRequest(request.url);
    if ("error" in parsed) {
      return parsed.error;
    }
    const rows = filterMetricsRows(parsed.dataset.dailyMetrics, parsed.range, parsed.locationIds);
    return HttpResponse.json({
      data: rows,
      meta: {
        startDate: parsed.range.startDate,
        endDate: parsed.range.endDate,
        locationIds: parsed.locationIds,
      },
    });
  }),
  http.get("*/api/v1/metrics/summary", async ({ request }) => {
    await applyScenarioDelay();
    const failure = maybeScenarioFailure("metrics");
    if (failure !== null) {
      return failure;
    }
    const parsed = parseMetricsRequest(request.url);
    if ("error" in parsed) {
      return parsed.error;
    }
    const previousPeriod = previousPeriodOf(parsed.range);
    const currentRows = filterMetricsRows(
      parsed.dataset.dailyMetrics,
      parsed.range,
      parsed.locationIds,
    );
    const previousRows = filterMetricsRows(
      parsed.dataset.dailyMetrics,
      previousPeriod,
      parsed.locationIds,
    );
    return HttpResponse.json({
      data: {
        current: computeMetricsTotals(currentRows),
        previous: computeMetricsTotals(previousRows),
        previousPeriod,
      },
    });
  }),
];
