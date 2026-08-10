import {
  ChartCard,
  MultiSelect,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@pulseboard/ui";
import { useState } from "react";

import { useAppSelector } from "../../app/hooks";
import { ComparisonBarChart } from "../../components/charts/ComparisonBarChart";
import { QueryStateGate } from "../../components/feedback/QueryStateGate";
import { WidgetErrorBoundary } from "../../components/feedback/WidgetErrorBoundary";
import {
  formatCount,
  formatCurrencyFromCents,
  formatPercentValue,
  formatRating,
} from "../../lib/formatters";
import { selectMetricsQueryArgs } from "../filters/selectMetricsQueryArgs";
import { rankLocationsByAnswerRate } from "../overview/transforms";
import { useGetDailyMetricsQuery } from "../overview/overviewApi";
import { useGetLocationsQuery } from "./locationsApi";

const LARGEST_COMPARISON_SET = 4;

export function LocationsComparePage() {
  const queryArgs = useAppSelector(selectMetricsQueryArgs);
  const dailyQuery = useGetDailyMetricsQuery(queryArgs);
  const locationsQuery = useGetLocationsQuery();
  const [comparedLocationIds, setComparedLocationIds] = useState<string[]>([]);

  const allLocations = locationsQuery.data ?? [];
  const effectiveComparedIds =
    comparedLocationIds.length > 0
      ? comparedLocationIds
      : allLocations.slice(0, 3).map((location) => location.id);

  return (
    <div className="space-y-4 p-6">
      <WidgetErrorBoundary>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-text-muted">
            Compare up to {LARGEST_COMPARISON_SET} offices across the selected date range.
          </p>
          <MultiSelect
            label="Compare"
            options={allLocations.map((location) => ({
              value: location.id,
              label: location.name,
            }))}
            selectedValues={comparedLocationIds}
            onSelectionChange={(selection) => {
              setComparedLocationIds(selection.slice(0, LARGEST_COMPARISON_SET));
            }}
            emptySelectionSummary="First 3 offices"
          />
        </div>
        <div className="grid gap-4 pt-4 xl:grid-cols-2">
          <ChartCard
            title="Calls by office"
            subtitle="Answered vs missed for the compared offices"
            status={dailyQuery.isLoading ? "loading" : "ready"}
          >
            <QueryStateGate query={dailyQuery} skeleton={null}>
              {(payload) => {
                const locationNames = new Map(
                  allLocations.map((location) => [location.id, location.name]),
                );
                const ranked = rankLocationsByAnswerRate(payload.rows, locationNames).filter(
                  (row) => effectiveComparedIds.includes(row.locationId),
                );
                return (
                  <ComparisonBarChart
                    ariaLabel="Answered and missed calls for the compared offices"
                    data={ranked.map((row) => ({
                      groupLabel: row.locationName.split(" ").slice(0, 2).join(" "),
                      values: [
                        { label: "Answered", value: row.answeredCalls, colorVariable: "--chart-1" },
                        { label: "Missed", value: row.missedCalls, colorVariable: "--chart-2" },
                      ],
                    }))}
                  />
                );
              }}
            </QueryStateGate>
          </ChartCard>
          <ChartCard
            title="Office scorecard"
            subtitle="Totals for the compared offices in this range"
            status={dailyQuery.isLoading ? "loading" : "ready"}
          >
            <QueryStateGate query={dailyQuery} skeleton={null}>
              {(payload) => {
                const comparedRows = payload.rows.filter((row) =>
                  effectiveComparedIds.includes(row.locationId),
                );
                const byLocation = effectiveComparedIds.map((locationId) => {
                  const rows = comparedRows.filter((row) => row.locationId === locationId);
                  const answered = rows.reduce((sum, row) => sum + row.calls.answered, 0);
                  const missed = rows.reduce((sum, row) => sum + row.calls.missed, 0);
                  const completed = rows.reduce((sum, row) => sum + row.appointments.completed, 0);
                  const noShows = rows.reduce((sum, row) => sum + row.appointments.noShows, 0);
                  const revenueCents = rows.reduce(
                    (sum, row) => sum + row.revenue.collectedCents,
                    0,
                  );
                  const ratingRows = rows.filter((row) => row.reviews.averageRating !== null);
                  const reviewCount = ratingRows.reduce(
                    (sum, row) => sum + row.reviews.received,
                    0,
                  );
                  const ratingSum = ratingRows.reduce(
                    (sum, row) => sum + (row.reviews.averageRating ?? 0) * row.reviews.received,
                    0,
                  );
                  return {
                    locationId,
                    name:
                      allLocations.find((location) => location.id === locationId)?.name ??
                      locationId,
                    answerRate:
                      answered + missed === 0 ? 0 : (answered / (answered + missed)) * 100,
                    completed,
                    noShows,
                    rating: reviewCount === 0 ? null : ratingSum / reviewCount,
                    revenueCents,
                  };
                });
                return (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>Office</TableHeaderCell>
                        <TableHeaderCell numeric>Answer rate</TableHeaderCell>
                        <TableHeaderCell numeric>Completed</TableHeaderCell>
                        <TableHeaderCell numeric>No-shows</TableHeaderCell>
                        <TableHeaderCell numeric>Rating</TableHeaderCell>
                        <TableHeaderCell numeric>Revenue</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {byLocation.map((row) => (
                        <TableRow key={row.locationId}>
                          <TableCell>{row.name}</TableCell>
                          <TableCell numeric>{formatPercentValue(row.answerRate)}</TableCell>
                          <TableCell numeric>{formatCount(row.completed)}</TableCell>
                          <TableCell numeric>{formatCount(row.noShows)}</TableCell>
                          <TableCell numeric>{formatRating(row.rating)}</TableCell>
                          <TableCell numeric>{formatCurrencyFromCents(row.revenueCents)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                );
              }}
            </QueryStateGate>
          </ChartCard>
        </div>
      </WidgetErrorBoundary>
    </div>
  );
}

export const Component = LocationsComparePage;
