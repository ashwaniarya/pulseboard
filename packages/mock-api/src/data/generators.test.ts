import { describe, expect, it } from "vitest";

import { CLINIC_LOCATIONS, getLocationProfile } from "./locations";
import { generateCallRecordsForDay } from "./generateCallRecords";
import { generateDailyMetricsForDay } from "./generateDailyMetrics";
import { generateDataset } from "./dataset";

const PINNED_END_DATE = "2026-08-10";

function requireLocation(index: number) {
  const location = CLINIC_LOCATIONS[index];
  if (location === undefined) {
    throw new Error(`expected a location at index ${String(index)}`);
  }
  return location;
}

const firstLocation = requireLocation(0);
const saturdayClosedLocation = CLINIC_LOCATIONS.find((location) => !location.openSaturdays);
const saturdayOpenLocation = CLINIC_LOCATIONS.find((location) => location.openSaturdays);

describe("generateCallRecordsForDay", () => {
  it("is deterministic for the same location and date", () => {
    expect(generateCallRecordsForDay(firstLocation, "2026-08-05")).toEqual(
      generateCallRecordsForDay(firstLocation, "2026-08-05"),
    );
  });

  it("generates zero calls on Sundays", () => {
    for (const location of CLINIC_LOCATIONS) {
      expect(generateCallRecordsForDay(location, "2026-08-09")).toHaveLength(0);
    }
  });

  it("generates Saturday calls only for Saturday-open locations", () => {
    if (saturdayClosedLocation === undefined || saturdayOpenLocation === undefined) {
      throw new Error("expected both Saturday behaviours in the roster");
    }
    expect(generateCallRecordsForDay(saturdayClosedLocation, "2026-08-08")).toHaveLength(0);
    expect(generateCallRecordsForDay(saturdayOpenLocation, "2026-08-08").length).toBeGreaterThan(0);
  });

  it("is busier on Mondays than Fridays across the fleet", () => {
    let mondayTotal = 0;
    let fridayTotal = 0;
    for (const location of CLINIC_LOCATIONS) {
      mondayTotal += generateCallRecordsForDay(location, "2026-08-03").length;
      fridayTotal += generateCallRecordsForDay(location, "2026-08-07").length;
    }
    expect(mondayTotal).toBeGreaterThan(fridayTotal);
  });

  it("gives every record a stable id scoped to location and date", () => {
    const records = generateCallRecordsForDay(firstLocation, "2026-08-05");
    const ids = new Set(records.map((record) => record.id));
    expect(ids.size).toBe(records.length);
    for (const record of records) {
      expect(record.id).toMatch(new RegExp(`^call-${firstLocation.id}-2026-08-05-\\d+$`));
    }
  });

  it("tracks the location answer-rate personality over a working month", () => {
    const profile = getLocationProfile(firstLocation);
    const workdays = ["2026-07-06", "2026-07-13", "2026-07-20", "2026-07-27", "2026-08-03"];
    let answered = 0;
    let total = 0;
    for (const date of workdays) {
      const records = generateCallRecordsForDay(firstLocation, date);
      answered += records.filter((record) => record.status === "answered").length;
      total += records.length;
    }
    const answeredShare = answered / total;
    expect(answeredShare).toBeGreaterThan(profile.answerRatePersonality - 0.08);
    expect(answeredShare).toBeLessThan(profile.answerRatePersonality + 0.08);
  });

  it("zeroes duration for missed and abandoned calls and staffs answered ones", () => {
    const records = generateCallRecordsForDay(firstLocation, "2026-08-04");
    for (const record of records) {
      if (record.status === "missed" || record.status === "abandoned") {
        expect(record.durationSeconds).toBe(0);
        expect(record.handledBy).toBeNull();
      }
      if (record.status === "answered") {
        expect(record.durationSeconds).toBeGreaterThan(0);
        expect(record.handledBy).not.toBeNull();
      }
    }
  });
});

describe("generateDailyMetricsForDay", () => {
  const date = "2026-08-05";

  it("reconciles the calls block with the underlying call records", () => {
    for (const location of CLINIC_LOCATIONS) {
      const records = generateCallRecordsForDay(location, date);
      const metrics = generateDailyMetricsForDay(location, date, records);
      const answeredRecords = records.filter((record) => record.status === "answered");
      const missedRecords = records.filter(
        (record) => record.status === "missed" || record.status === "abandoned",
      );
      const voicemailRecords = records.filter((record) => record.status === "voicemail");
      expect(metrics.calls.answered).toBe(answeredRecords.length);
      expect(metrics.calls.missed).toBe(missedRecords.length);
      expect(metrics.calls.voicemail).toBe(voicemailRecords.length);
      expect(metrics.calls.answered + metrics.calls.missed + metrics.calls.voicemail).toBe(
        records.length,
      );
    }
  });

  it("derives average answer seconds from answered records only", () => {
    const records = generateCallRecordsForDay(firstLocation, date);
    const metrics = generateDailyMetricsForDay(firstLocation, date, records);
    const answeredWaits = records
      .filter((record) => record.status === "answered")
      .map((record) => record.waitSeconds);
    const expectedAverage =
      answeredWaits.reduce((sum, wait) => sum + wait, 0) / answeredWaits.length;
    expect(metrics.calls.averageAnswerSeconds).toBeCloseTo(expectedAverage, 0);
  });

  it("keeps appointment buckets internally consistent", () => {
    const records = generateCallRecordsForDay(firstLocation, date);
    const metrics = generateDailyMetricsForDay(firstLocation, date, records);
    expect(metrics.appointments.booked).toBe(
      metrics.appointments.completed +
        metrics.appointments.noShows +
        metrics.appointments.cancellations,
    );
  });

  it("prices revenue from completed appointments within the noise band", () => {
    const profile = getLocationProfile(firstLocation);
    const records = generateCallRecordsForDay(firstLocation, date);
    const metrics = generateDailyMetricsForDay(firstLocation, date, records);
    const baseline = metrics.appointments.completed * profile.revenuePerCompletedAppointmentCents;
    expect(metrics.revenue.collectedCents).toBeGreaterThanOrEqual(Math.floor(baseline * 0.85));
    expect(metrics.revenue.collectedCents).toBeLessThanOrEqual(Math.ceil(baseline * 1.15));
  });

  it("reports a null average rating exactly when no reviews arrived", () => {
    let sawZeroReviewDay = false;
    let sawReviewDay = false;
    for (const location of CLINIC_LOCATIONS) {
      for (const checkDate of ["2026-08-03", "2026-08-04", "2026-08-05", "2026-08-06"]) {
        const records = generateCallRecordsForDay(location, checkDate);
        const metrics = generateDailyMetricsForDay(location, checkDate, records);
        if (metrics.reviews.received === 0) {
          sawZeroReviewDay = true;
          expect(metrics.reviews.averageRating).toBeNull();
        } else {
          sawReviewDay = true;
          expect(metrics.reviews.averageRating).toBeGreaterThanOrEqual(1);
          expect(metrics.reviews.averageRating).toBeLessThanOrEqual(5);
        }
      }
    }
    expect(sawZeroReviewDay).toBe(true);
    expect(sawReviewDay).toBe(true);
  });

  it("lets messages trickle on Sundays while calls stay silent", () => {
    const records = generateCallRecordsForDay(firstLocation, "2026-08-09");
    const metrics = generateDailyMetricsForDay(firstLocation, "2026-08-09", records);
    expect(metrics.calls.answered + metrics.calls.missed + metrics.calls.voicemail).toBe(0);
    expect(metrics.appointments.booked).toBe(0);
    expect(metrics.messages.received).toBeGreaterThanOrEqual(0);
  });
});

describe("generateDataset", () => {
  it("returns deep-equal datasets for the same arguments", () => {
    const firstRun = generateDataset({ endDate: PINNED_END_DATE, dayCount: 30 });
    const secondRun = generateDataset({ endDate: PINNED_END_DATE, dayCount: 30 });
    expect(firstRun).toEqual(secondRun);
  });

  it("covers every location for every day in the window", () => {
    const dataset = generateDataset({ endDate: PINNED_END_DATE, dayCount: 30 });
    expect(dataset.dailyMetrics).toHaveLength(30 * CLINIC_LOCATIONS.length);
    expect(dataset.startDate).toBe("2026-07-12");
    expect(dataset.endDate).toBe(PINNED_END_DATE);
  });

  it("produces a call volume in the expected band for ninety days", () => {
    const dataset = generateDataset({ endDate: PINNED_END_DATE, dayCount: 90 });
    expect(dataset.callRecords.length).toBeGreaterThan(30000);
    expect(dataset.callRecords.length).toBeLessThan(70000);
  });

  it("agrees on overlapping dates when the anomaly-free window slides forward", () => {
    const earlierWindow = generateDataset({
      endDate: "2026-08-03",
      dayCount: 30,
      includeAnomalies: false,
    });
    const laterWindow = generateDataset({
      endDate: PINNED_END_DATE,
      dayCount: 30,
      includeAnomalies: false,
    });
    const sharedDate = "2026-07-30";
    const pickShared = (dataset: typeof earlierWindow) =>
      dataset.dailyMetrics.filter((metrics) => metrics.date === sharedDate);
    expect(pickShared(laterWindow)).toEqual(pickShared(earlierWindow));
  });
});
