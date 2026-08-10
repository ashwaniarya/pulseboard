import {
  DATASET_SEED_VERSION,
  type CallCategory,
  type CallDirection,
  type CallRecord,
  type CallStatus,
  type ClinicLocation,
} from "../domain";
import { dayOfWeekIndex, daysBetween } from "./dateMath";
import { getLocationProfile } from "./locations";
import { CALLER_FIRST_NAMES, CALLER_LAST_NAMES, STAFF_MEMBER_NAMES } from "./nameLists";
import {
  createStreamRandom,
  pickOne,
  pickWeighted,
  randomFloatBetween,
  randomGaussian,
} from "./seededRandom";

const BASE_WEEKDAY_CALL_COUNT = 45;
const GROWTH_EPOCH_DATE = "2026-01-01";
const GROWTH_PER_DAY = 0.00065;

const SUNDAY_INDEX = 0;
const SATURDAY_INDEX = 6;

const WEEKDAY_CALL_MULTIPLIERS: Record<number, number> = {
  0: 0,
  1: 1.3,
  2: 1.1,
  3: 1.0,
  4: 0.95,
  5: 0.85,
  6: 0.35,
};

export function weekdayCallMultiplier(location: ClinicLocation, isoDate: string): number {
  const weekday = dayOfWeekIndex(isoDate);
  if (weekday === SUNDAY_INDEX) {
    return 0;
  }
  if (weekday === SATURDAY_INDEX && !location.openSaturdays) {
    return 0;
  }
  return WEEKDAY_CALL_MULTIPLIERS[weekday] ?? 0;
}

export function growthDriftMultiplier(isoDate: string): number {
  const daysSinceEpoch = daysBetween(GROWTH_EPOCH_DATE, isoDate);
  return Math.min(1.3, Math.max(0.85, 1 + daysSinceEpoch * GROWTH_PER_DAY));
}

function clampSeconds(value: number, minimum: number, maximum: number): number {
  return Math.round(Math.min(maximum, Math.max(minimum, value)));
}

const CALL_STATUS_FALLBACK_WEIGHTS: readonly { value: CallStatus; weight: number }[] = [
  { value: "missed", weight: 5 },
  { value: "voicemail", weight: 3 },
  { value: "abandoned", weight: 2 },
];

const CALL_CATEGORY_WEIGHTS: readonly { value: CallCategory; weight: number }[] = [
  { value: "scheduling", weight: 45 },
  { value: "billing", weight: 15 },
  { value: "insurance", weight: 15 },
  { value: "prescription", weight: 10 },
  { value: "other", weight: 15 },
];

function drawStatus(random: () => number, answerRatePersonality: number): CallStatus {
  if (random() < answerRatePersonality) {
    return "answered";
  }
  return pickWeighted(random, CALL_STATUS_FALLBACK_WEIGHTS);
}

function drawWaitSeconds(random: () => number, status: CallStatus): number {
  if (status === "answered") {
    return clampSeconds(randomGaussian(random, 22, 8), 3, 90);
  }
  if (status === "voicemail") {
    return clampSeconds(randomGaussian(random, 35, 10), 10, 120);
  }
  if (status === "missed") {
    return clampSeconds(randomGaussian(random, 40, 15), 10, 150);
  }
  return clampSeconds(randomGaussian(random, 55, 20), 15, 180);
}

function drawDurationSeconds(random: () => number, status: CallStatus): number {
  if (status === "answered") {
    return clampSeconds(randomGaussian(random, 240, 90), 30, 1200);
  }
  if (status === "voicemail") {
    return clampSeconds(randomGaussian(random, 40, 15), 10, 120);
  }
  return 0;
}

function drawStartedAt(random: () => number, isoDate: string): string {
  const officeOpensAtHour = 8;
  const officeClosesAtHour = 17.5;
  const secondsIntoDay = Math.floor(
    randomFloatBetween(random, officeOpensAtHour, officeClosesAtHour) * 3600,
  );
  const timestamp = new Date(`${isoDate}T00:00:00.000Z`).getTime() + secondsIntoDay * 1000;
  return new Date(timestamp).toISOString();
}

export function generateCallRecordsForDay(
  location: ClinicLocation,
  isoDate: string,
  volumeMultiplier = 1,
): CallRecord[] {
  const multiplier = weekdayCallMultiplier(location, isoDate) * volumeMultiplier;
  if (multiplier === 0) {
    return [];
  }
  const profile = getLocationProfile(location);
  const random = createStreamRandom(`${DATASET_SEED_VERSION}:${location.id}:calls:${isoDate}`);
  const expectedCallCount =
    BASE_WEEKDAY_CALL_COUNT * profile.callVolumeScale * multiplier * growthDriftMultiplier(isoDate);
  const callCount = Math.max(
    0,
    Math.round(randomGaussian(random, expectedCallCount, expectedCallCount * 0.12)),
  );

  const records: CallRecord[] = [];
  for (let callIndex = 0; callIndex < callCount; callIndex += 1) {
    const status = drawStatus(random, profile.answerRatePersonality);
    const direction: CallDirection = random() < 0.8 ? "inbound" : "outbound";
    const callerName = `${pickOne(random, CALLER_FIRST_NAMES)} ${pickOne(random, CALLER_LAST_NAMES)}`;
    records.push({
      id: `call-${location.id}-${isoDate}-${callIndex}`,
      locationId: location.id,
      startedAt: drawStartedAt(random, isoDate),
      direction,
      status,
      category: pickWeighted(random, CALL_CATEGORY_WEIGHTS),
      callerName,
      durationSeconds: drawDurationSeconds(random, status),
      waitSeconds: drawWaitSeconds(random, status),
      handledBy: status === "answered" ? pickOne(random, STAFF_MEMBER_NAMES) : null,
    });
  }
  return records.sort((first, second) =>
    first.startedAt === second.startedAt
      ? first.id.localeCompare(second.id)
      : first.startedAt.localeCompare(second.startedAt),
  );
}
