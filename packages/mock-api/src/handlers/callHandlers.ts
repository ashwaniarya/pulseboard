import { http, HttpResponse } from "msw";

import type { CallCategory, CallDirection, CallStatus } from "../domain";
import { getActiveDataset } from "../data/dataset";
import { applyScenarioDelay, maybeScenarioFailure } from "../scenarios";
import {
  CALL_SORT_KEYS,
  DEFAULT_PAGE_SIZE,
  SORT_DIRECTIONS,
  filterCallRecords,
  paginateRecords,
  sortCallRecords,
  type CallSortKey,
  type SortDirection,
} from "./shared/filterSortPaginate";
import {
  parseDateRangeParams,
  parseEnumListParam,
  parseLocationIdsParam,
  problemResponseFor,
} from "./shared/parseQuery";

const CALL_STATUSES: readonly CallStatus[] = ["answered", "missed", "voicemail", "abandoned"];
const CALL_DIRECTIONS: readonly CallDirection[] = ["inbound", "outbound"];
const CALL_CATEGORIES: readonly CallCategory[] = [
  "scheduling",
  "billing",
  "insurance",
  "prescription",
  "other",
];

export const callHandlers = [
  http.get("*/api/v1/calls", async ({ request }) => {
    await applyScenarioDelay();
    const failure = maybeScenarioFailure("calls");
    if (failure !== null) {
      return failure;
    }

    const url = new URL(request.url);
    const dataset = getActiveDataset();

    const rangeResult = parseDateRangeParams(url);
    if (!rangeResult.ok) {
      return problemResponseFor(rangeResult);
    }
    const validIds = new Set(dataset.locations.map((location) => location.id));
    const locationIdsResult = parseLocationIdsParam(url, validIds);
    if (!locationIdsResult.ok) {
      return problemResponseFor(locationIdsResult);
    }
    const statusesResult = parseEnumListParam(url, "statuses", CALL_STATUSES);
    if (!statusesResult.ok) {
      return problemResponseFor(statusesResult);
    }
    const directionsResult = parseEnumListParam(url, "directions", CALL_DIRECTIONS);
    if (!directionsResult.ok) {
      return problemResponseFor(directionsResult);
    }
    const categoriesResult = parseEnumListParam(url, "categories", CALL_CATEGORIES);
    if (!categoriesResult.ok) {
      return problemResponseFor(categoriesResult);
    }
    const sortByResult = parseEnumListParam(url, "sortBy", CALL_SORT_KEYS);
    if (!sortByResult.ok) {
      return problemResponseFor(sortByResult);
    }
    const sortDirectionResult = parseEnumListParam(url, "sortDirection", SORT_DIRECTIONS);
    if (!sortDirectionResult.ok) {
      return problemResponseFor(sortDirectionResult);
    }

    const sortBy: CallSortKey = sortByResult.value[0] ?? "startedAt";
    const sortDirection: SortDirection = sortDirectionResult.value[0] ?? "desc";
    const locationFilter =
      locationIdsResult.value.length === 0 ? null : new Set(locationIdsResult.value);

    const inRange = dataset.callRecords.filter((record) => {
      const recordDate = record.startedAt.slice(0, 10);
      if (recordDate < rangeResult.value.startDate || recordDate > rangeResult.value.endDate) {
        return false;
      }
      return locationFilter === null || locationFilter.has(record.locationId);
    });

    const filtered = filterCallRecords(inRange, {
      statuses: statusesResult.value,
      directions: directionsResult.value,
      categories: categoriesResult.value,
      search: url.searchParams.get("search") ?? undefined,
    });
    const sorted = sortCallRecords(filtered, sortBy, sortDirection);
    const paginated = paginateRecords(sorted, {
      page: Number(url.searchParams.get("page") ?? "1"),
      pageSize: Number(url.searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE)),
    });

    return HttpResponse.json(paginated);
  }),
];
