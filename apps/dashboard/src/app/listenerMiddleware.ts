import {
  createListenerMiddleware,
  isAnyOf,
  isFulfilled,
  isRejectedWithValue,
} from "@reduxjs/toolkit";

import {
  dateRangeChanged,
  locationSelectionChanged,
  type FiltersState,
} from "../features/filters/filtersSlice";
import { serializeFiltersToUrl } from "../features/filters/urlSync";
import { apiRequestFailed, apiRequestSucceeded } from "../features/apiHealth/apiHealthSlice";

export const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  matcher: isAnyOf(dateRangeChanged, locationSelectionChanged),
  effect: (_action, listenerApi) => {
    const state = listenerApi.getState() as { filters: FiltersState };
    const query = serializeFiltersToUrl(state.filters);
    window.history.replaceState(null, "", `${window.location.pathname}?${query}`);
  },
});

listenerMiddleware.startListening({
  matcher: isRejectedWithValue,
  effect: (_action, listenerApi) => {
    listenerApi.dispatch(apiRequestFailed({ atMs: Date.now() }));
  },
});

listenerMiddleware.startListening({
  matcher: isFulfilled,
  effect: (action, listenerApi) => {
    if (action.type.startsWith("api/")) {
      const state = listenerApi.getState() as { apiHealth: { status: string } };
      if (state.apiHealth.status === "degraded") {
        listenerApi.dispatch(apiRequestSucceeded());
      }
    }
  },
});
