import { configureStore } from "@reduxjs/toolkit";

import { baseApi } from "../services/api/baseApi";

export function createDashboardStore() {
  return configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
  });
}

export type DashboardStore = ReturnType<typeof createDashboardStore>;
export type RootState = ReturnType<DashboardStore["getState"]>;
export type AppDispatch = DashboardStore["dispatch"];
