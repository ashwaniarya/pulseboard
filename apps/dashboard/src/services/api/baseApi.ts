import { createApi } from "@reduxjs/toolkit/query/react";

import { retryingBaseQuery } from "./retryingBaseQuery";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: retryingBaseQuery,
  tagTypes: ["Locations", "MetricsSummary", "DailyMetrics", "Calls"],
  endpoints: () => ({}),
});
