import { setupServer } from "msw/node";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { CLINIC_LOCATIONS } from "../data/locations";
import { configureDataset, getActiveDataset } from "../data/dataset";
import { allHandlers } from "./index";

const PINNED_END_DATE = "2026-08-10";
const BASE_URL = "http://pulseboard.test/api/v1";

const server = setupServer(...allHandlers);

beforeAll(() => {
  configureDataset({ endDate: PINNED_END_DATE, dayCount: 90 });
  server.listen({ onUnhandledRequest: "error" });
});

afterAll(() => {
  server.close();
});

async function getJson(path: string) {
  const response = await fetch(`${BASE_URL}${path}`);
  const body: unknown = await response.json();
  return { response, body: body as Record<string, never> };
}

describe("GET /api/v1/locations", () => {
  it("returns the full roster in a data envelope", async () => {
    const { response, body } = await getJson("/locations");
    expect(response.status).toBe(200);
    const data = body.data as unknown as { id: string }[];
    expect(data).toHaveLength(12);
    expect(data.map((location) => location.id)).toEqual(
      CLINIC_LOCATIONS.map((location) => location.id),
    );
  });
});

describe("GET /api/v1/metrics/daily", () => {
  it("requires a date range", async () => {
    const { response, body } = await getJson("/metrics/daily");
    expect(response.status).toBe(400);
    expect(response.headers.get("content-type")).toContain("application/problem+json");
    expect(body.title).toBeDefined();
  });

  it("rejects a start date after the end date", async () => {
    const { response } = await getJson("/metrics/daily?startDate=2026-08-09&endDate=2026-08-01");
    expect(response.status).toBe(400);
  });

  it("rejects malformed dates", async () => {
    const { response } = await getJson("/metrics/daily?startDate=today&endDate=2026-08-09");
    expect(response.status).toBe(400);
  });

  it("rejects unknown location ids and names the offender", async () => {
    const { response, body } = await getJson(
      "/metrics/daily?startDate=2026-08-03&endDate=2026-08-09&locationIds=loc-nowhere",
    );
    expect(response.status).toBe(400);
    expect(JSON.stringify(body)).toContain("loc-nowhere");
  });

  it("returns one row per location per day in range", async () => {
    const { response, body } = await getJson(
      "/metrics/daily?startDate=2026-08-03&endDate=2026-08-09&locationIds=loc-cedar-park",
    );
    expect(response.status).toBe(200);
    const data = body.data as unknown as { date: string; locationId: string }[];
    expect(data).toHaveLength(7);
    expect(data.every((entry) => entry.locationId === "loc-cedar-park")).toBe(true);
    const meta = body.meta as unknown as { startDate: string; endDate: string };
    expect(meta.startDate).toBe("2026-08-03");
    expect(meta.endDate).toBe("2026-08-09");
  });
});

describe("GET /api/v1/metrics/summary", () => {
  it("computes totals for the range and the previous equal-length window", async () => {
    const { response, body } = await getJson(
      "/metrics/summary?startDate=2026-08-04&endDate=2026-08-10",
    );
    expect(response.status).toBe(200);
    const data = body.data as unknown as {
      current: { callsAnswered: number; revenueCollectedCents: number };
      previous: { callsAnswered: number };
      previousPeriod: { startDate: string; endDate: string };
    };
    expect(data.previousPeriod).toEqual({ startDate: "2026-07-28", endDate: "2026-08-03" });

    const dataset = getActiveDataset();
    const sumAnswered = (startDate: string, endDate: string) =>
      dataset.dailyMetrics
        .filter((metrics) => metrics.date >= startDate && metrics.date <= endDate)
        .reduce((sum, metrics) => sum + metrics.calls.answered, 0);
    expect(data.current.callsAnswered).toBe(sumAnswered("2026-08-04", "2026-08-10"));
    expect(data.previous.callsAnswered).toBe(sumAnswered("2026-07-28", "2026-08-03"));
    expect(data.current.revenueCollectedCents).toBeGreaterThan(0);
  });

  it("respects the location filter", async () => {
    const { body } = await getJson(
      "/metrics/summary?startDate=2026-08-04&endDate=2026-08-10&locationIds=loc-palm-court",
    );
    const data = body.data as unknown as { current: { callsAnswered: number } };
    const dataset = getActiveDataset();
    const expected = dataset.dailyMetrics
      .filter(
        (metrics) =>
          metrics.locationId === "loc-palm-court" &&
          metrics.date >= "2026-08-04" &&
          metrics.date <= "2026-08-10",
      )
      .reduce((sum, metrics) => sum + metrics.calls.answered, 0);
    expect(data.current.callsAnswered).toBe(expected);
  });
});

describe("GET /api/v1/health", () => {
  it("reports dataset vitals", async () => {
    const { response, body } = await getJson("/health");
    expect(response.status).toBe(200);
    const data = body.data as unknown as {
      status: string;
      datasetSeedVersion: string;
      dayCount: number;
      recordCounts: { callRecords: number; dailyMetrics: number };
    };
    const dataset = getActiveDataset();
    expect(data.status).toBe("ok");
    expect(data.datasetSeedVersion).toBe("pulseboard-v1");
    expect(data.dayCount).toBe(90);
    expect(data.recordCounts.callRecords).toBe(dataset.callRecords.length);
    expect(data.recordCounts.dailyMetrics).toBe(dataset.dailyMetrics.length);
  });
});
