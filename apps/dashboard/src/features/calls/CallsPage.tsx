import type { CallRecord } from "@pulseboard/mock-api";
import {
  Badge,
  EmptyState,
  Button,
  Input,
  MultiSelect,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  type TableSortDirection,
} from "@pulseboard/ui";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef, useState } from "react";

import { useAppSelector } from "../../app/hooks";
import { QueryStateGate } from "../../components/feedback/QueryStateGate";
import { WidgetErrorBoundary } from "../../components/feedback/WidgetErrorBoundary";
import { formatCount, formatSeconds } from "../../lib/formatters";
import { selectMetricsQueryArgs } from "../filters/selectMetricsQueryArgs";
import { useGetLocationsQuery } from "../locations/locationsApi";
import { CALLS_PAGE_SIZE, useGetCallsInfiniteInfiniteQuery } from "./callsApi";
import { useCallsSearchParams } from "./useCallsSearchParams";

const STATUS_OPTIONS = [
  { value: "answered", label: "Answered" },
  { value: "missed", label: "Missed" },
  { value: "voicemail", label: "Voicemail" },
  { value: "abandoned", label: "Abandoned" },
];

const STATUS_BADGE_TONES: Record<
  CallRecord["status"],
  "positive" | "negative" | "neutral" | "warning"
> = {
  answered: "positive",
  missed: "negative",
  voicemail: "neutral",
  abandoned: "warning",
};

const ROW_HEIGHT_PX = 41;

function startedAtLabel(startedAt: string): string {
  return new Date(startedAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

function sortDirectionFor(
  column: string,
  activeSortBy: string,
  activeDirection: string,
): TableSortDirection {
  if (column !== activeSortBy) {
    return null;
  }
  return activeDirection === "asc" ? "asc" : "desc";
}

export function CallsPage() {
  const metricsArgs = useAppSelector(selectMetricsQueryArgs);
  const { filters, updateFilters } = useCallsSearchParams();
  const [searchDraft, setSearchDraft] = useState(filters.search);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchDraft !== filters.search) {
        updateFilters({ search: searchDraft });
      }
    }, 250);
    return () => {
      clearTimeout(debounceTimer);
    };
  });

  const callsQuery = useGetCallsInfiniteInfiniteQuery({
    startDate: metricsArgs.startDate,
    endDate: metricsArgs.endDate,
    locationIds: metricsArgs.locationIds,
    statuses: filters.statuses,
    search: filters.search,
    sortBy: filters.sortBy,
    sortDirection: filters.sortDirection,
  });
  const locationsQuery = useGetLocationsQuery();

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const loadedRecords = callsQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const totalRecords = callsQuery.data?.pages[0]?.pagination.totalRecords ?? 0;

  const rowVirtualizer = useVirtualizer({
    count: loadedRecords.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => ROW_HEIGHT_PX,
    overscan: 12,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const lastVirtualRow = virtualRows[virtualRows.length - 1];
  useEffect(() => {
    if (
      lastVirtualRow !== undefined &&
      lastVirtualRow.index >= loadedRecords.length - 20 &&
      callsQuery.hasNextPage &&
      !callsQuery.isFetchingNextPage
    ) {
      void callsQuery.fetchNextPage();
    }
  }, [lastVirtualRow, loadedRecords.length, callsQuery]);

  const locationNames = new Map(
    (locationsQuery.data ?? []).map((location) => [location.id, location.name]),
  );

  const toggleSort = (column: string) => {
    if (filters.sortBy === column) {
      updateFilters({ sortDirection: filters.sortDirection === "desc" ? "asc" : "desc" });
      return;
    }
    updateFilters({ sortBy: column, sortDirection: "desc" });
  };

  return (
    <div className="space-y-4 p-6">
      <WidgetErrorBoundary>
        <div className="flex flex-wrap items-end gap-3">
          <Input
            label="Search callers"
            placeholder="e.g. Anderson"
            value={searchDraft}
            onChange={(event) => {
              setSearchDraft(event.target.value);
            }}
            className="w-64"
          />
          <MultiSelect
            label="Status"
            options={STATUS_OPTIONS}
            selectedValues={filters.statuses === "" ? [] : filters.statuses.split(",")}
            onSelectionChange={(selection) => {
              updateFilters({ statuses: selection.join(",") });
            }}
            emptySelectionSummary="All statuses"
          />
          <p className="numeric-data ml-auto text-sm text-text-muted">
            {formatCount(loadedRecords.length)} of {formatCount(totalRecords)} calls loaded
          </p>
        </div>
        <div className="pt-4">
          <QueryStateGate
            query={callsQuery}
            skeleton={
              <div
                aria-busy="true"
                className="h-[560px] animate-pulse rounded-large bg-surface-sunken"
              />
            }
            emptyWhen={(data) => data.pages[0]?.pagination.totalRecords === 0}
            empty={
              <EmptyState
                title="No calls match these filters"
                description="Clear the search or widen the date range to see call activity."
                action={
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => {
                      setSearchDraft("");
                      updateFilters({ search: "", statuses: "" });
                    }}
                  >
                    Clear filters
                  </Button>
                }
              />
            }
          >
            {() => (
              <div ref={scrollContainerRef} className="max-h-[560px] overflow-y-auto rounded-large">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell
                        sortDirection={sortDirectionFor(
                          "startedAt",
                          filters.sortBy,
                          filters.sortDirection,
                        )}
                        onSortToggle={() => {
                          toggleSort("startedAt");
                        }}
                      >
                        Started
                      </TableHeaderCell>
                      <TableHeaderCell
                        sortDirection={sortDirectionFor(
                          "callerName",
                          filters.sortBy,
                          filters.sortDirection,
                        )}
                        onSortToggle={() => {
                          toggleSort("callerName");
                        }}
                      >
                        Caller
                      </TableHeaderCell>
                      <TableHeaderCell>Location</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                      <TableHeaderCell>Category</TableHeaderCell>
                      <TableHeaderCell
                        numeric
                        sortDirection={sortDirectionFor(
                          "waitSeconds",
                          filters.sortBy,
                          filters.sortDirection,
                        )}
                        onSortToggle={() => {
                          toggleSort("waitSeconds");
                        }}
                      >
                        Wait
                      </TableHeaderCell>
                      <TableHeaderCell
                        numeric
                        sortDirection={sortDirectionFor(
                          "durationSeconds",
                          filters.sortBy,
                          filters.sortDirection,
                        )}
                        onSortToggle={() => {
                          toggleSort("durationSeconds");
                        }}
                      >
                        Duration
                      </TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {virtualRows[0] !== undefined && (
                      <tr aria-hidden>
                        <td colSpan={7} style={{ height: virtualRows[0].start, padding: 0 }} />
                      </tr>
                    )}
                    {virtualRows.map((virtualRow) => {
                      const record = loadedRecords[virtualRow.index];
                      if (record === undefined) {
                        return null;
                      }
                      return (
                        <TableRow key={record.id} data-index={virtualRow.index}>
                          <TableCell className="whitespace-nowrap text-text-muted">
                            {startedAtLabel(record.startedAt)}
                          </TableCell>
                          <TableCell>{record.callerName}</TableCell>
                          <TableCell className="text-text-muted">
                            {locationNames.get(record.locationId) ?? record.locationId}
                          </TableCell>
                          <TableCell>
                            <Badge tone={STATUS_BADGE_TONES[record.status]}>{record.status}</Badge>
                          </TableCell>
                          <TableCell className="text-text-muted">{record.category}</TableCell>
                          <TableCell numeric>{formatSeconds(record.waitSeconds)}</TableCell>
                          <TableCell numeric>
                            {record.durationSeconds === 0
                              ? "—"
                              : formatSeconds(record.durationSeconds)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {lastVirtualRow !== undefined && (
                      <tr aria-hidden>
                        <td
                          colSpan={7}
                          style={{
                            height: rowVirtualizer.getTotalSize() - lastVirtualRow.end,
                            padding: 0,
                          }}
                        />
                      </tr>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </QueryStateGate>
        </div>
      </WidgetErrorBoundary>
    </div>
  );
}

export const Component = CallsPage;
export { CALLS_PAGE_SIZE };
