import { useSearchParams } from "react-router";

export interface CallsLocalFilters {
  statuses: string;
  search: string;
  sortBy: string;
  sortDirection: string;
}

const DEFAULT_CALLS_FILTERS: CallsLocalFilters = {
  statuses: "",
  search: "",
  sortBy: "startedAt",
  sortDirection: "desc",
};

export function useCallsSearchParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: CallsLocalFilters = {
    statuses: searchParams.get("statuses") ?? DEFAULT_CALLS_FILTERS.statuses,
    search: searchParams.get("search") ?? DEFAULT_CALLS_FILTERS.search,
    sortBy: searchParams.get("sortBy") ?? DEFAULT_CALLS_FILTERS.sortBy,
    sortDirection: searchParams.get("sortDirection") ?? DEFAULT_CALLS_FILTERS.sortDirection,
  };

  const updateFilters = (changes: Partial<CallsLocalFilters>) => {
    setSearchParams(
      (currentParams) => {
        const nextParams = new URLSearchParams(currentParams);
        for (const [key, value] of Object.entries(changes)) {
          const defaultValue = DEFAULT_CALLS_FILTERS[key as keyof CallsLocalFilters];
          if (value === defaultValue) {
            nextParams.delete(key);
          } else {
            nextParams.set(key, value);
          }
        }
        return nextParams;
      },
      { replace: true },
    );
  };

  return { filters, updateFilters };
}
