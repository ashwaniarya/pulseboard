import { createSelector } from "@reduxjs/toolkit";

import type { FiltersState } from "./filtersSlice";

export interface MetricsQueryArgs {
  startDate: string;
  endDate: string;
  locationIds: string;
}

interface StateWithFilters {
  filters: FiltersState;
}

export const selectMetricsQueryArgs = createSelector(
  [
    (state: StateWithFilters) => state.filters.dateRange.startDate,
    (state: StateWithFilters) => state.filters.dateRange.endDate,
    (state: StateWithFilters) => state.filters.selectedLocationIds,
  ],
  (startDate, endDate, selectedLocationIds): MetricsQueryArgs => ({
    startDate,
    endDate,
    locationIds: selectedLocationIds.join(","),
  }),
);
