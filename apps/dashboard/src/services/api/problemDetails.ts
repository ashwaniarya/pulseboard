import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
}

export function isProblemDetails(candidate: unknown): candidate is ProblemDetails {
  if (typeof candidate !== "object" || candidate === null) {
    return false;
  }
  const record = candidate as Record<string, unknown>;
  return (
    typeof record.type === "string" &&
    typeof record.title === "string" &&
    typeof record.status === "number" &&
    typeof record.detail === "string"
  );
}

export function userMessageFromApiError(error: FetchBaseQueryError | undefined): string {
  if (error === undefined) {
    return "Something went wrong loading this data.";
  }
  if (error.status === "FETCH_ERROR" || error.status === "TIMEOUT_ERROR") {
    return "We couldn't reach the data service — check the connection and try again.";
  }
  if ("data" in error && isProblemDetails(error.data)) {
    return error.data.detail;
  }
  return "The data service returned an unexpected error. Try again.";
}
