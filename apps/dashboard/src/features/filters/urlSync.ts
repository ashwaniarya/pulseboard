import { isDateRangePresetId, isValidIsoDate, resolveDateRangePreset } from "../../lib/dateRange";
import { createInitialFiltersState, type FiltersState } from "./filtersSlice";

export function parseFiltersFromUrl(search: string, todayIso: string): FiltersState {
  const params = new URLSearchParams(search);
  const state = createInitialFiltersState(todayIso);

  const presetParam = params.get("range");
  const startParam = params.get("startDate");
  const endParam = params.get("endDate");
  if (isDateRangePresetId(presetParam)) {
    state.dateRange = { presetId: presetParam, ...resolveDateRangePreset(presetParam, todayIso) };
  } else if (isValidIsoDate(startParam) && isValidIsoDate(endParam) && startParam <= endParam) {
    state.dateRange = { presetId: null, startDate: startParam, endDate: endParam };
  }

  const locationsParam = params.get("locations");
  if (locationsParam !== null && locationsParam.trim() !== "") {
    state.selectedLocationIds = locationsParam.split(",").map((id) => id.trim());
  }

  return state;
}

export function serializeFiltersToUrl(state: FiltersState): string {
  const params = new URLSearchParams();
  if (state.dateRange.presetId !== null) {
    params.set("range", state.dateRange.presetId);
  } else {
    params.set("startDate", state.dateRange.startDate);
    params.set("endDate", state.dateRange.endDate);
  }
  if (state.selectedLocationIds.length > 0) {
    params.set("locations", state.selectedLocationIds.join(","));
  }
  return params.toString();
}
