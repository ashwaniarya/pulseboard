import type { DailyLocationMetrics } from "../../domain";

export interface MetricsTotals {
  callsAnswered: number;
  callsMissed: number;
  callsVoicemail: number;
  averageAnswerSeconds: number;
  appointmentsBooked: number;
  appointmentsCompleted: number;
  appointmentsNoShows: number;
  appointmentsCancellations: number;
  messagesSent: number;
  messagesReceived: number;
  reviewsReceived: number;
  averageRating: number | null;
  revenueCollectedCents: number;
}

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

export function computeMetricsTotals(rows: readonly DailyLocationMetrics[]): MetricsTotals {
  let callsAnswered = 0;
  let callsMissed = 0;
  let callsVoicemail = 0;
  let answerSecondsWeightedSum = 0;
  let appointmentsBooked = 0;
  let appointmentsCompleted = 0;
  let appointmentsNoShows = 0;
  let appointmentsCancellations = 0;
  let messagesSent = 0;
  let messagesReceived = 0;
  let reviewsReceived = 0;
  let ratingWeightedSum = 0;
  let revenueCollectedCents = 0;

  for (const row of rows) {
    callsAnswered += row.calls.answered;
    callsMissed += row.calls.missed;
    callsVoicemail += row.calls.voicemail;
    answerSecondsWeightedSum += row.calls.averageAnswerSeconds * row.calls.answered;
    appointmentsBooked += row.appointments.booked;
    appointmentsCompleted += row.appointments.completed;
    appointmentsNoShows += row.appointments.noShows;
    appointmentsCancellations += row.appointments.cancellations;
    messagesSent += row.messages.sent;
    messagesReceived += row.messages.received;
    reviewsReceived += row.reviews.received;
    if (row.reviews.averageRating !== null) {
      ratingWeightedSum += row.reviews.averageRating * row.reviews.received;
    }
    revenueCollectedCents += row.revenue.collectedCents;
  }

  return {
    callsAnswered,
    callsMissed,
    callsVoicemail,
    averageAnswerSeconds:
      callsAnswered === 0 ? 0 : roundToOneDecimal(answerSecondsWeightedSum / callsAnswered),
    appointmentsBooked,
    appointmentsCompleted,
    appointmentsNoShows,
    appointmentsCancellations,
    messagesSent,
    messagesReceived,
    reviewsReceived,
    averageRating:
      reviewsReceived === 0 ? null : roundToOneDecimal(ratingWeightedSum / reviewsReceived),
    revenueCollectedCents,
  };
}
