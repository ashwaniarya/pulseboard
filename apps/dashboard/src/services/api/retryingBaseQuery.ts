import { fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";

export function shouldRetryRequest(error: FetchBaseQueryError): boolean {
  if (typeof error.status === "number") {
    return error.status >= 500;
  }
  return error.status === "FETCH_ERROR" || error.status === "TIMEOUT_ERROR";
}

function resolveApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return new URL("/api/v1", window.location.origin).toString();
  }
  return "http://localhost/api/v1";
}

export const retryingBaseQuery = retry(fetchBaseQuery({ baseUrl: resolveApiBaseUrl() }), {
  retryCondition: (error, _args, extraArgs) =>
    extraArgs.attempt <= 2 && shouldRetryRequest(error as FetchBaseQueryError),
});
