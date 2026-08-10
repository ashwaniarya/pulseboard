import {
  DATASET_SEED_VERSION,
  type CallRecord,
  type ClinicLocation,
  type DailyLocationMetrics,
} from "../domain";
import { getLocationProfile } from "./locations";
import { growthDriftMultiplier, weekdayCallMultiplier } from "./generateCallRecords";
import { dayOfWeekIndex } from "./dateMath";
import { createStreamRandom, randomGaussian } from "./seededRandom";

const SUNDAY_MESSAGE_TRICKLE_MULTIPLIER = 0.15;

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function aggregateCallMetrics(callRecords: readonly CallRecord[]) {
  const answeredRecords = callRecords.filter((record) => record.status === "answered");
  const missedCount = callRecords.filter(
    (record) => record.status === "missed" || record.status === "abandoned",
  ).length;
  const voicemailCount = callRecords.filter((record) => record.status === "voicemail").length;
  const averageAnswerSeconds =
    answeredRecords.length === 0
      ? 0
      : roundToOneDecimal(
          answeredRecords.reduce((sum, record) => sum + record.waitSeconds, 0) /
            answeredRecords.length,
        );
  return {
    answered: answeredRecords.length,
    missed: missedCount,
    voicemail: voicemailCount,
    averageAnswerSeconds,
  };
}

export function generateDailyMetricsForDay(
  location: ClinicLocation,
  isoDate: string,
  callRecords: readonly CallRecord[],
): DailyLocationMetrics {
  const profile = getLocationProfile(location);
  const officeOpenMultiplier = weekdayCallMultiplier(location, isoDate);
  const drift = growthDriftMultiplier(isoDate);
  const random = createStreamRandom(`${DATASET_SEED_VERSION}:${location.id}:daily:${isoDate}`);

  let booked = 0;
  let noShows = 0;
  let cancellations = 0;
  if (officeOpenMultiplier > 0) {
    const expectedBookings = location.staffCount * 1.5 * officeOpenMultiplier * drift;
    booked = Math.max(
      0,
      Math.round(randomGaussian(random, expectedBookings, expectedBookings * 0.18)),
    );
    const noShowShare = Math.min(
      0.3,
      Math.max(0, randomGaussian(random, profile.noShowRate, profile.noShowRate * 0.3)),
    );
    noShows = Math.min(booked, Math.round(booked * noShowShare));
    const cancellationShare = Math.min(0.2, Math.max(0, randomGaussian(random, 0.06, 0.02)));
    cancellations = Math.min(booked - noShows, Math.round(booked * cancellationShare));
  }
  const completed = booked - noShows - cancellations;

  const messageMultiplier =
    dayOfWeekIndex(isoDate) === 0
      ? SUNDAY_MESSAGE_TRICKLE_MULTIPLIER
      : Math.max(officeOpenMultiplier, 0.4);
  const expectedSentMessages = location.staffCount * 2.2 * messageMultiplier * drift;
  const messagesSent = Math.max(
    0,
    Math.round(randomGaussian(random, expectedSentMessages, expectedSentMessages * 0.2)),
  );
  const messagesReceived = Math.max(
    0,
    Math.round(randomGaussian(random, expectedSentMessages * 1.15, expectedSentMessages * 0.22)),
  );

  const expectedReviews = 1.6 * profile.callVolumeScale * officeOpenMultiplier;
  const reviewsReceived = Math.max(0, Math.floor(randomGaussian(random, expectedReviews, 1)));
  const averageRating =
    reviewsReceived === 0
      ? null
      : roundToOneDecimal(
          Math.min(5, Math.max(1, randomGaussian(random, profile.ratingCenter, 0.35))),
        );

  const revenueNoise = Math.min(1.13, Math.max(0.87, randomGaussian(random, 1, 0.05)));
  const collectedCents = Math.round(
    completed * profile.revenuePerCompletedAppointmentCents * revenueNoise,
  );

  return {
    date: isoDate,
    locationId: location.id,
    calls: aggregateCallMetrics(callRecords),
    appointments: { booked, completed, noShows, cancellations },
    messages: { sent: messagesSent, received: messagesReceived },
    reviews: { received: reviewsReceived, averageRating },
    revenue: { collectedCents },
  };
}
