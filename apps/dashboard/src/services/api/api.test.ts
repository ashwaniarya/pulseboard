import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { baseApi } from "./baseApi";
import { isProblemDetails, userMessageFromApiError } from "./problemDetails";
import { shouldRetryRequest } from "./retryingBaseQuery";
import { createDashboardStore } from "../../app/store";
import { mockApiServer as server } from "../../test/mockApiServer";

const testApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    probeHealth: build.query<unknown, void>({
      query: () => "/health",
    }),
  }),
});

describe("shouldRetryRequest", () => {
  it("retries server errors and network failures only", () => {
    expect(shouldRetryRequest({ status: 503, data: undefined })).toBe(true);
    expect(shouldRetryRequest({ status: 500, data: undefined })).toBe(true);
    expect(shouldRetryRequest({ status: "FETCH_ERROR", error: "boom" })).toBe(true);
    expect(shouldRetryRequest({ status: 404, data: undefined })).toBe(false);
    expect(shouldRetryRequest({ status: 400, data: undefined })).toBe(false);
  });
});

describe("retrying base query through the store", () => {
  it("attempts a failing request three times before surfacing the error", async () => {
    let attemptCount = 0;
    server.use(
      http.get("*/api/v1/health", () => {
        attemptCount += 1;
        return HttpResponse.json({ title: "down" }, { status: 503 });
      }),
    );
    const store = createDashboardStore();
    const result = await store.dispatch(testApi.endpoints.probeHealth.initiate());
    expect(result.isError).toBe(true);
    expect(attemptCount).toBe(3);
  });

  it("does not retry client errors", async () => {
    let attemptCount = 0;
    server.use(
      http.get("*/api/v1/health", () => {
        attemptCount += 1;
        return HttpResponse.json({ title: "bad request" }, { status: 400 });
      }),
    );
    const store = createDashboardStore();
    const result = await store.dispatch(testApi.endpoints.probeHealth.initiate());
    expect(result.isError).toBe(true);
    expect(attemptCount).toBe(1);
  });

  it("resolves real handler data on success", async () => {
    const store = createDashboardStore();
    const result = await store.dispatch(testApi.endpoints.probeHealth.initiate());
    expect(result.isSuccess).toBe(true);
  });
});

describe("problem details", () => {
  it("recognises an RFC 9457 body", () => {
    expect(
      isProblemDetails({ type: "x", title: "Invalid query parameter", status: 400, detail: "d" }),
    ).toBe(true);
    expect(isProblemDetails({ message: "nope" })).toBe(false);
  });

  it("prefers the problem detail text in user messages", () => {
    const message = userMessageFromApiError({
      status: 400,
      data: {
        type: "https://pulseboard.dev/problems/invalid-parameter",
        title: "Invalid query parameter",
        status: 400,
        detail: "startDate is malformed.",
      },
    });
    expect(message).toBe("startDate is malformed.");
  });

  it("falls back to a friendly message for network failures", () => {
    expect(userMessageFromApiError({ status: "FETCH_ERROR", error: "failed" })).toContain(
      "connection",
    );
  });
});
