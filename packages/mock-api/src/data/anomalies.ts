import type { CallRecord, DailyLocationMetrics, LocationId } from "../domain";
import { shiftIsoDate } from "./dateMath";
import { hashStringToSeed } from "./seededRandom";

export type AnomalyKey = "phone-outage" | "review-bomb" | "flu-surge" | "holiday-closure";

export interface AnomalyWindow {
  key: AnomalyKey;
  label: string;
  description: string;
  locationIds: readonly LocationId[] | "all";
  startDate: string;
  endDate: string;
}

export const PHONE_OUTAGE_LOCATION_ID: LocationId = "loc-lakeview";
export const REVIEW_BOMB_LOCATION_ID: LocationId = "loc-sunrise-mesa";

const FLU_SURGE_CALL_MULTIPLIER = 1.35;
const OUTAGE_FLIP_PERCENT = 85;

interface AnomalyOffsets {
  startOffset: number;
  endOffset: number;
}

const ANOMALY_OFFSET_TABLE: Record<AnomalyKey, AnomalyOffsets> = {
  "phone-outage": { startOffset: -52, endOffset: -49 },
  "review-bomb": { startOffset: -33, endOffset: -27 },
  "flu-surge": { startOffset: -21, endOffset: -14 },
  "holiday-closure": { startOffset: -45, endOffset: -45 },
};

export interface AnomalyCalendar {
  windows: readonly AnomalyWindow[];
  callVolumeMultiplierFor(locationId: LocationId, isoDate: string): number;
  transformCallRecords(records: CallRecord[], isoDate: string): CallRecord[];
  transformDailyMetrics(metrics: DailyLocationMetrics): DailyLocationMetrics;
}

function isWithin(isoDate: string, window: AnomalyWindow): boolean {
  return isoDate >= window.startDate && isoDate <= window.endDate;
}

function resolveWindow(
  endDate: string,
  key: AnomalyKey,
  label: string,
  description: string,
  locationIds: readonly LocationId[] | "all",
): AnomalyWindow {
  const offsets = ANOMALY_OFFSET_TABLE[key];
  return {
    key,
    label,
    description,
    locationIds,
    startDate: shiftIsoDate(endDate, offsets.startOffset),
    endDate: shiftIsoDate(endDate, offsets.endOffset),
  };
}

function flipOutageRecord(record: CallRecord): CallRecord {
  const flipHash = hashStringToSeed(`${record.id}:outage`);
  if (record.status === "answered" && flipHash % 100 < OUTAGE_FLIP_PERCENT) {
    return {
      ...record,
      status: flipHash % 2 === 0 ? "missed" : "abandoned",
      waitSeconds: Math.min(300, record.waitSeconds * 3),
      durationSeconds: 0,
      handledBy: null,
    };
  }
  if (record.status === "answered") {
    return { ...record, waitSeconds: Math.min(240, record.waitSeconds * 2) };
  }
  return record;
}

function bombedAverageRating(isoDate: string): number {
  return 3 + (hashStringToSeed(`${isoDate}:review-bomb`) % 5) / 10;
}

export function resolveAnomalyCalendar(endDate: string): AnomalyCalendar {
  const phoneOutage = resolveWindow(
    endDate,
    "phone-outage",
    "Phone outage",
    "Lakeview Smiles lost its phone lines; answered calls crater while waits spike.",
    [PHONE_OUTAGE_LOCATION_ID],
  );
  const reviewBomb = resolveWindow(
    endDate,
    "review-bomb",
    "Review bomb",
    "Sunrise Mesa Dental takes a wave of one-star reviews before recovering.",
    [REVIEW_BOMB_LOCATION_ID],
  );
  const fluSurge = resolveWindow(
    endDate,
    "flu-surge",
    "Flu season surge",
    "Every office fields extra calls while no-shows climb.",
    "all",
  );
  const holidayClosure = resolveWindow(
    endDate,
    "holiday-closure",
    "Holiday closure",
    "All locations closed for the holiday; only messages trickle in.",
    "all",
  );
  const windows: readonly AnomalyWindow[] = [phoneOutage, reviewBomb, fluSurge, holidayClosure];

  return {
    windows,
    callVolumeMultiplierFor(locationId, isoDate) {
      void locationId;
      if (isWithin(isoDate, holidayClosure)) {
        return 0;
      }
      if (isWithin(isoDate, fluSurge)) {
        return FLU_SURGE_CALL_MULTIPLIER;
      }
      return 1;
    },
    transformCallRecords(records, isoDate) {
      if (!isWithin(isoDate, phoneOutage)) {
        return records;
      }
      return records.map((record) =>
        record.locationId === PHONE_OUTAGE_LOCATION_ID ? flipOutageRecord(record) : record,
      );
    },
    transformDailyMetrics(metrics) {
      let transformed = metrics;
      if (isWithin(transformed.date, holidayClosure)) {
        transformed = {
          ...transformed,
          appointments: { booked: 0, completed: 0, noShows: 0, cancellations: 0 },
          messages: {
            sent: Math.round(transformed.messages.sent * 0.15),
            received: Math.round(transformed.messages.received * 0.15),
          },
          reviews: { received: 0, averageRating: null },
          revenue: { collectedCents: 0 },
        };
      }
      if (isWithin(transformed.date, fluSurge)) {
        const surgedNoShows = Math.min(
          transformed.appointments.booked - transformed.appointments.cancellations,
          Math.round(transformed.appointments.noShows * 1.5),
        );
        transformed = {
          ...transformed,
          appointments: {
            ...transformed.appointments,
            noShows: surgedNoShows,
            completed:
              transformed.appointments.booked -
              surgedNoShows -
              transformed.appointments.cancellations,
          },
        };
      }
      if (
        isWithin(transformed.date, reviewBomb) &&
        transformed.locationId === REVIEW_BOMB_LOCATION_ID
      ) {
        transformed = {
          ...transformed,
          reviews: {
            received: transformed.reviews.received + 3,
            averageRating: bombedAverageRating(transformed.date),
          },
        };
      }
      return transformed;
    },
  };
}
