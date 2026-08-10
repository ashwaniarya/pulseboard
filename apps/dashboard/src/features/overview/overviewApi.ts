import type { DailyLocationMetrics } from "@pulseboard/mock-api";

import { baseApi } from "../../services/api/baseApi";
import type { MetricsQueryArgs } from "../filters/selectMetricsQueryArgs";

export interface AnomalyWindowSummary {
  key: string;
  label: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface DailyMetricsPayload {
  rows: DailyLocationMetrics[];
  anomalyWindows: AnomalyWindowSummary[];
}

export interface MetricsTotals {
  callsAnswered: number;
  callsMissed: number;
  callsVoicemail: number;
  averageAnswerSeconds: number;
  appointmentsBooked: number;
  appointmentsCompleted: number;
  appointmentsNoShows: number;
  appointmentsCancellations: number;
  messagesSent: number;
  messagesReceived: number;
  reviewsReceived: number;
  averageRating: number | null;
  revenueCollectedCents: number;
}

export interface MetricsSummary {
  current: MetricsTotals;
  previous: MetricsTotals;
  previousPeriod: { startDate: string; endDate: string };
}

function metricsSearchParams(args: MetricsQueryArgs): string {
  const params = new URLSearchParams({ startDate: args.startDate, endDate: args.endDate });
  if (args.locationIds !== "") {
    params.set("locationIds", args.locationIds);
  }
  return params.toString();
}

export const overviewApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMetricsSummary: build.query<MetricsSummary, MetricsQueryArgs>({
      query: (args) => `/metrics/summary?${metricsSearchParams(args)}`,
      transformResponse: (response: { data: MetricsSummary }) => response.data,
      providesTags: ["MetricsSummary"],
    }),
    getDailyMetrics: build.query<DailyMetricsPayload, MetricsQueryArgs>({
      query: (args) => `/metrics/daily?${metricsSearchParams(args)}`,
      transformResponse: (response: {
        data: DailyLocationMetrics[];
        meta: { anomalyWindows?: AnomalyWindowSummary[] };
      }) => ({
        rows: response.data,
        anomalyWindows: response.meta.anomalyWindows ?? [],
      }),
      providesTags: ["DailyMetrics"],
    }),
  }),
});

export const { useGetMetricsSummaryQuery, useGetDailyMetricsQuery } = overviewApi;
