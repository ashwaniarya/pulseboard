import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";

import {
  dateRangeChanged,
  locationSelectionChanged,
  type FiltersState,
} from "../features/filters/filtersSlice";
import { serializeFiltersToUrl } from "../features/filters/urlSync";

export const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  matcher: isAnyOf(dateRangeChanged, locationSelectionChanged),
  effect: (_action, listenerApi) => {
    const state = listenerApi.getState() as { filters: FiltersState };
    const query = serializeFiltersToUrl(state.filters);
    window.history.replaceState(null, "", `${window.location.pathname}?${query}`);
  },
});
