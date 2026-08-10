import type { CallCategory, CallDirection, CallRecord, CallStatus } from "../../domain";

export interface CallRecordFilters {
  statuses?: readonly CallStatus[];
  directions?: readonly CallDirection[];
  categories?: readonly CallCategory[];
  search?: string;
}

export function filterCallRecords(
  records: readonly CallRecord[],
  filters: CallRecordFilters,
): CallRecord[] {
  const statusFilter = filters.statuses?.length ? new Set(filters.statuses) : null;
  const directionFilter = filters.directions?.length ? new Set(filters.directions) : null;
  const categoryFilter = filters.categories?.length ? new Set(filters.categories) : null;
  const searchNeedle = filters.search?.trim().toLowerCase() ?? "";
  return records.filter((record) => {
    if (statusFilter !== null && !statusFilter.has(record.status)) {
      return false;
    }
    if (directionFilter !== null && !directionFilter.has(record.direction)) {
      return false;
    }
    if (categoryFilter !== null && !categoryFilter.has(record.category)) {
      return false;
    }
    if (searchNeedle !== "" && !record.callerName.toLowerCase().includes(searchNeedle)) {
      return false;
    }
    return true;
  });
}

export const CALL_SORT_KEYS = [
  "startedAt",
  "waitSeconds",
  "durationSeconds",
  "callerName",
] as const;
export type CallSortKey = (typeof CALL_SORT_KEYS)[number];

export const SORT_DIRECTIONS = ["asc", "desc"] as const;
export type SortDirection = (typeof SORT_DIRECTIONS)[number];

function compareByKey(first: CallRecord, second: CallRecord, sortBy: CallSortKey): number {
  if (sortBy === "waitSeconds" || sortBy === "durationSeconds") {
    return first[sortBy] - second[sortBy];
  }
  return first[sortBy].localeCompare(second[sortBy]);
}

export function sortCallRecords(
  records: readonly CallRecord[],
  sortBy: CallSortKey,
  direction: SortDirection,
): CallRecord[] {
  const directionFactor = direction === "asc" ? 1 : -1;
  return [...records].sort((first, second) => {
    const primaryComparison = compareByKey(first, second, sortBy) * directionFactor;
    if (primaryComparison !== 0) {
      return primaryComparison;
    }
    return first.id.localeCompare(second.id);
  });
}

export const SMALLEST_PAGE_SIZE = 1;
export const LARGEST_PAGE_SIZE = 500;
export const DEFAULT_PAGE_SIZE = 50;

export interface PageRequest {
  page: number;
  pageSize: number;
}

export interface PaginationSummary {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface PaginatedRecords<T> {
  data: T[];
  pagination: PaginationSummary;
}

export function clampPageSize(rawPageSize: number): number {
  if (Number.isNaN(rawPageSize)) {
    return DEFAULT_PAGE_SIZE;
  }
  return Math.min(LARGEST_PAGE_SIZE, Math.max(SMALLEST_PAGE_SIZE, Math.floor(rawPageSize)));
}

export function paginateRecords<T>(
  records: readonly T[],
  request: PageRequest,
): PaginatedRecords<T> {
  const pageSize = clampPageSize(request.pageSize);
  const page = Number.isNaN(request.page) ? 1 : Math.max(1, Math.floor(request.page));
  const totalRecords = records.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const startIndex = (page - 1) * pageSize;
  return {
    data: records.slice(startIndex, startIndex + pageSize),
    pagination: {
      page,
      pageSize,
      totalRecords,
      totalPages,
      hasNextPage: startIndex + pageSize < totalRecords,
    },
  };
}
