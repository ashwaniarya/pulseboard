import { describe, expect, it } from "vitest";

import { resolveAnomalyCalendar } from "./anomalies";
import { generateDataset } from "./dataset";
import { CLINIC_LOCATIONS, getLocationProfile } from "./locations";

const PINNED_END_DATE = "2026-08-10";

const OUTAGE_LOCATION_ID = "loc-lakeview";
const REVIEW_BOMB_LOCATION_ID = "loc-sunrise-mesa";

function metricsFor(dataset: ReturnType<typeof generateDataset>, locationId: string, date: string) {
  const metrics = dataset.dailyMetrics.find(
    (entry) => entry.locationId === locationId && entry.date === date,
  );
  if (metrics === undefined) {
    throw new Error(`expected metrics for ${locationId} on ${date}`);
  }
  return metrics;
}

describe("resolveAnomalyCalendar", () => {
  it("positions all four anomaly windows relative to the end date", () => {
    const calendar = resolveAnomalyCalendar(PINNED_END_DATE);
    const windowKeys = calendar.windows.map((window) => window.key);
    expect(windowKeys).toEqual(["phone-outage", "review-bomb", "flu-surge", "holiday-closure"]);
    const outageWindow = calendar.windows.find((window) => window.key === "phone-outage");
    expect(outageWindow?.startDate).toBe("2026-06-19");
    expect(outageWindow?.endDate).toBe("2026-06-22");
  });
});

describe("phone outage anomaly", () => {
  it("craters the answer rate at the outage location during the window", () => {
    const dataset = generateDataset({ endDate: PINNED_END_DATE, dayCount: 90 });
    const outageLocation = CLINIC_LOCATIONS.find((location) => location.id === OUTAGE_LOCATION_ID);
    if (outageLocation === undefined) {
      throw new Error("expected the outage location in the roster");
    }
    const personality = getLocationProfile(outageLocation).answerRatePersonality;
    for (const outageWeekday of ["2026-06-19", "2026-06-22"]) {
      const metrics = metricsFor(dataset, OUTAGE_LOCATION_ID, outageWeekday);
      const totalCalls = metrics.calls.answered + metrics.calls.missed + metrics.calls.voicemail;
      expect(totalCalls).toBeGreaterThan(0);
      expect(metrics.calls.answered / totalCalls).toBeLessThan(personality * 0.3);
    }
  });

  it("keeps the outage location normal outside the window", () => {
    const dataset = generateDataset({ endDate: PINNED_END_DATE, dayCount: 90 });
    const metrics = metricsFor(dataset, OUTAGE_LOCATION_ID, "2026-07-01");
    const totalCalls = metrics.calls.answered + metrics.calls.missed + metrics.calls.voicemail;
    expect(metrics.calls.answered / totalCalls).toBeGreaterThan(0.6);
  });
});

describe("holiday closure anomaly", () => {
  it("closes every location on the holiday", () => {
    const dataset = generateDataset({ endDate: PINNED_END_DATE, dayCount: 90 });
    for (const location of CLINIC_LOCATIONS) {
      const metrics = metricsFor(dataset, location.id, "2026-06-26");
      expect(metrics.calls.answered + metrics.calls.missed + metrics.calls.voicemail).toBe(0);
      expect(metrics.appointments.booked).toBe(0);
      expect(metrics.revenue.collectedCents).toBe(0);
    }
  });
});

describe("flu surge anomaly", () => {
  it("lifts fleet call volume roughly thirty-five percent during the surge", () => {
    const withAnomalies = generateDataset({ endDate: PINNED_END_DATE, dayCount: 90 });
    const baseline = generateDataset({
      endDate: PINNED_END_DATE,
      dayCount: 90,
      includeAnomalies: false,
    });
    const surgeDate = "2026-07-22";
    const surgeTotal = withAnomalies.callRecords.filter((record) =>
      record.startedAt.startsWith(surgeDate),
    ).length;
    const baselineTotal = baseline.callRecords.filter((record) =>
      record.startedAt.startsWith(surgeDate),
    ).length;
    const ratio = surgeTotal / baselineTotal;
    expect(ratio).toBeGreaterThan(1.2);
    expect(ratio).toBeLessThan(1.5);
  });

  it("raises no-shows during the surge without breaking bucket consistency", () => {
    const withAnomalies = generateDataset({ endDate: PINNED_END_DATE, dayCount: 90 });
    const baseline = generateDataset({
      endDate: PINNED_END_DATE,
      dayCount: 90,
      includeAnomalies: false,
    });
    const surgeDate = "2026-07-22";
    let surgeNoShows = 0;
    let baselineNoShows = 0;
    for (const location of CLINIC_LOCATIONS) {
      const surgeMetrics = metricsFor(withAnomalies, location.id, surgeDate);
      surgeNoShows += surgeMetrics.appointments.noShows;
      baselineNoShows += metricsFor(baseline, location.id, surgeDate).appointments.noShows;
      expect(surgeMetrics.appointments.booked).toBe(
        surgeMetrics.appointments.completed +
          surgeMetrics.appointments.noShows +
          surgeMetrics.appointments.cancellations,
      );
    }
    expect(surgeNoShows).toBeGreaterThan(baselineNoShows);
  });
});

describe("review bomb anomaly", () => {
  it("drags the bombed location rating down for the week then lets it recover", () => {
    const dataset = generateDataset({ endDate: PINNED_END_DATE, dayCount: 90 });
    const collectRatings = (dates: string[]) =>
      dates
        .map((date) => metricsFor(dataset, REVIEW_BOMB_LOCATION_ID, date).reviews.averageRating)
        .filter((rating): rating is number => rating !== null);
    const bombWeekRatings = collectRatings([
      "2026-07-08",
      "2026-07-09",
      "2026-07-10",
      "2026-07-13",
      "2026-07-14",
    ]);
    const recoveryRatings = collectRatings([
      "2026-07-20",
      "2026-07-21",
      "2026-07-22",
      "2026-07-23",
      "2026-07-24",
    ]);
    const average = (ratings: number[]) =>
      ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    expect(bombWeekRatings.length).toBeGreaterThan(0);
    expect(average(bombWeekRatings)).toBeLessThan(3.5);
    expect(average(recoveryRatings)).toBeGreaterThan(average(bombWeekRatings) + 0.5);
  });
});
