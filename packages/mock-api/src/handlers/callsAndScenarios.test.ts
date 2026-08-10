import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { configureDataset, getActiveDataset } from "../data/dataset";
import { createMockApiNodeServer } from "../node";
import { resolveScenarioKey, setActiveScenario, setScenarioRandomSource } from "../scenarios";
import { filterCallRecords, paginateRecords, sortCallRecords } from "./shared/filterSortPaginate";

const PINNED_END_DATE = "2026-08-10";
const BASE_URL = "http://pulseboard.test/api/v1";

const server = createMockApiNodeServer();

beforeAll(() => {
  configureDataset({ endDate: PINNED_END_DATE, dayCount: 90 });
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  setActiveScenario("healthy");
  setScenarioRandomSource(Math.random);
});

afterAll(() => {
  server.close();
});

async function getJson(path: string) {
  const response = await fetch(`${BASE_URL}${path}`);
  const body: unknown = await response.json();
  return { response, body: body as Record<string, never> };
}

describe("filterSortPaginate pure helpers", () => {
  const sampleRecords = () =>
    getActiveDataset().callRecords.filter((record) => record.startedAt.startsWith("2026-08-05"));

  it("filters by status list", () => {
    const filtered = filterCallRecords(sampleRecords(), { statuses: ["missed", "abandoned"] });
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((record) => ["missed", "abandoned"].includes(record.status))).toBe(true);
  });

  it("searches caller names case-insensitively", () => {
    const records = sampleRecords();
    const firstRecord = records[0];
    if (firstRecord === undefined) {
      throw new Error("expected sample records");
    }
    const needle = firstRecord.callerName.slice(0, 4).toUpperCase();
    const filtered = filterCallRecords(records, { search: needle });
    expect(filtered.length).toBeGreaterThan(0);
    expect(
      filtered.every((record) => record.callerName.toLowerCase().includes(needle.toLowerCase())),
    ).toBe(true);
  });

  it("sorts by wait seconds descending with a stable id tie-break", () => {
    const sorted = sortCallRecords(sampleRecords(), "waitSeconds", "desc");
    for (let index = 1; index < sorted.length; index += 1) {
      const previous = sorted[index - 1];
      const current = sorted[index];
      if (previous === undefined || current === undefined) {
        throw new Error("expected records while scanning sort order");
      }
      expect(previous.waitSeconds).toBeGreaterThanOrEqual(current.waitSeconds);
      if (previous.waitSeconds === current.waitSeconds) {
        expect(previous.id.localeCompare(current.id)).toBeLessThan(0);
      }
    }
  });

  it("paginates with a total count independent of page size", () => {
    const records = sortCallRecords(sampleRecords(), "startedAt", "asc");
    const smallPages = paginateRecords(records, { page: 2, pageSize: 10 });
    const largePages = paginateRecords(records, { page: 1, pageSize: 100 });
    expect(smallPages.pagination.totalRecords).toBe(records.length);
    expect(largePages.pagination.totalRecords).toBe(records.length);
    expect(smallPages.data).toEqual(records.slice(10, 20));
    expect(smallPages.pagination.hasNextPage).toBe(records.length > 20);
  });
});

describe("GET /api/v1/calls", () => {
  it("requires a date range", async () => {
    const { response } = await getJson("/calls");
    expect(response.status).toBe(400);
  });

  it("rejects an unknown sort key", async () => {
    const { response, body } = await getJson(
      "/calls?startDate=2026-08-03&endDate=2026-08-09&sortBy=callerMood",
    );
    expect(response.status).toBe(400);
    expect(JSON.stringify(body)).toContain("callerMood");
  });

  it("returns paginated, sorted, filtered records with an envelope", async () => {
    const { response, body } = await getJson(
      "/calls?startDate=2026-08-03&endDate=2026-08-09&locationIds=loc-cedar-park&statuses=missed&sortBy=waitSeconds&sortDirection=desc&page=1&pageSize=25",
    );
    expect(response.status).toBe(200);
    const data = body.data as unknown as {
      locationId: string;
      status: string;
      waitSeconds: number;
    }[];
    const pagination = body.pagination as unknown as {
      page: number;
      pageSize: number;
      totalRecords: number;
      totalPages: number;
      hasNextPage: boolean;
    };
    expect(data.length).toBeLessThanOrEqual(25);
    expect(data.every((record) => record.locationId === "loc-cedar-park")).toBe(true);
    expect(data.every((record) => record.status === "missed")).toBe(true);
    const waits = data.map((record) => record.waitSeconds);
    expect([...waits].sort((a, b) => b - a)).toEqual(waits);
    expect(pagination.page).toBe(1);
    expect(pagination.totalPages).toBe(Math.ceil(pagination.totalRecords / 25));
  });

  it("clamps the page size to five hundred", async () => {
    const { body } = await getJson("/calls?startDate=2026-08-03&endDate=2026-08-09&pageSize=9999");
    const pagination = body.pagination as unknown as { pageSize: number };
    expect(pagination.pageSize).toBe(500);
  });

  it("returns an empty page beyond the last one", async () => {
    const { body } = await getJson(
      "/calls?startDate=2026-08-05&endDate=2026-08-05&locationIds=loc-palm-court&page=999&pageSize=100",
    );
    const data = body.data as unknown as unknown[];
    const pagination = body.pagination as unknown as { hasNextPage: boolean };
    expect(data).toHaveLength(0);
    expect(pagination.hasNextPage).toBe(false);
  });
});

describe("scenario controls", () => {
  it("resolves the scenario from query string over storage over default", () => {
    expect(resolveScenarioKey({ queryString: "?apiScenario=outage", storedValue: "slow" })).toBe(
      "outage",
    );
    expect(resolveScenarioKey({ queryString: "", storedValue: "slow" })).toBe("slow");
    expect(resolveScenarioKey({ queryString: "", storedValue: null })).toBe("healthy");
    expect(resolveScenarioKey({ queryString: "?apiScenario=bogus", storedValue: null })).toBe(
      "healthy",
    );
  });

  it("fails metrics requests at the configured rate when degraded", async () => {
    setActiveScenario("degraded");
    setScenarioRandomSource(() => 0);
    const failing = await fetch(
      `${BASE_URL}/metrics/summary?startDate=2026-08-04&endDate=2026-08-10`,
    );
    expect(failing.status).toBe(503);
    expect(failing.headers.get("content-type")).toContain("application/problem+json");

    setScenarioRandomSource(() => 0.99);
    const passing = await fetch(
      `${BASE_URL}/metrics/summary?startDate=2026-08-04&endDate=2026-08-10`,
    );
    expect(passing.status).toBe(200);
  });

  it("keeps location and health endpoints alive while degraded", async () => {
    setActiveScenario("degraded");
    setScenarioRandomSource(() => 0);
    const locations = await fetch(`${BASE_URL}/locations`);
    expect(locations.status).toBe(200);
  });

  it("fails everything during an outage", async () => {
    setActiveScenario("outage");
    setScenarioRandomSource(() => 0.99);
    const locations = await fetch(`${BASE_URL}/locations`);
    const calls = await fetch(`${BASE_URL}/calls?startDate=2026-08-03&endDate=2026-08-09`);
    expect(locations.status).toBe(503);
    expect(calls.status).toBe(503);
  });
});
