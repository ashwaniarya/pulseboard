export const DATASET_SEED_VERSION = "pulseboard-v1";

export type LocationId = string;

export interface ClinicLocation {
  id: LocationId;
  name: string;
  city: string;
  state: string;
  timeZone: string;
  staffCount: number;
  openSaturdays: boolean;
}

export interface LocationProfile {
  callVolumeScale: number;
  answerRatePersonality: number;
  noShowRate: number;
  ratingCenter: number;
  revenuePerCompletedAppointmentCents: number;
}

export interface DailyLocationMetrics {
  date: string;
  locationId: LocationId;
  calls: {
    answered: number;
    missed: number;
    voicemail: number;
    averageAnswerSeconds: number;
  };
  appointments: {
    booked: number;
    completed: number;
    noShows: number;
    cancellations: number;
  };
  messages: {
    sent: number;
    received: number;
  };
  reviews: {
    received: number;
    averageRating: number | null;
  };
  revenue: {
    collectedCents: number;
  };
}

export type CallStatus = "answered" | "missed" | "voicemail" | "abandoned";
export type CallDirection = "inbound" | "outbound";
export type CallCategory = "scheduling" | "billing" | "insurance" | "prescription" | "other";

export interface CallRecord {
  id: string;
  locationId: LocationId;
  startedAt: string;
  direction: CallDirection;
  status: CallStatus;
  category: CallCategory;
  callerName: string;
  durationSeconds: number;
  waitSeconds: number;
  handledBy: string | null;
}
