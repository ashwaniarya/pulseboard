import { configureStore } from "@reduxjs/toolkit";

import { filtersReducer } from "../features/filters/filtersSlice";
import { baseApi } from "../services/api/baseApi";
import { listenerMiddleware } from "./listenerMiddleware";

export function createDashboardStore() {
  return configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      filters: filtersReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(listenerMiddleware.middleware).concat(baseApi.middleware),
  });
}

export type DashboardStore = ReturnType<typeof createDashboardStore>;
export type RootState = ReturnType<DashboardStore["getState"]>;
export type AppDispatch = DashboardStore["dispatch"];
