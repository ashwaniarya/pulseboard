import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import {
  resolveDateRangePreset,
  todayIsoDate,
  type DateRange,
  type DateRangePresetId,
} from "../../lib/dateRange";

export interface FiltersDateRangeState extends DateRange {
  presetId: DateRangePresetId | null;
}

export interface FiltersState {
  dateRange: FiltersDateRangeState;
  selectedLocationIds: string[];
}

export function createInitialFiltersState(todayIso: string): FiltersState {
  return {
    dateRange: { presetId: "last30", ...resolveDateRangePreset("last30", todayIso) },
    selectedLocationIds: [],
  };
}

const filtersSlice = createSlice({
  name: "filters",
  initialState: () => createInitialFiltersState(todayIsoDate()),
  reducers: {
    dateRangeChanged: (
      state,
      action: PayloadAction<{ range: DateRange; presetId: DateRangePresetId | null }>,
    ) => {
      state.dateRange = { presetId: action.payload.presetId, ...action.payload.range };
    },
    locationSelectionChanged: (state, action: PayloadAction<string[]>) => {
      state.selectedLocationIds = action.payload;
    },
    filtersHydratedFromUrl: (_state, action: PayloadAction<FiltersState>) => action.payload,
  },
});

export const { dateRangeChanged, locationSelectionChanged, filtersHydratedFromUrl } =
  filtersSlice.actions;
export const filtersReducer = filtersSlice.reducer;
