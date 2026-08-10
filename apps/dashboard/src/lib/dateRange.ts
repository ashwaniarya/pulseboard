export type DateRangePresetId = "last7" | "last30" | "last90";

export interface DateRange {
  startDate: string;
  endDate: string;
}

export const DATE_RANGE_PRESETS: readonly {
  id: DateRangePresetId;
  label: string;
  dayCount: number;
}[] = [
  { id: "last7", label: "Last 7 days", dayCount: 7 },
  { id: "last30", label: "Last 30 days", dayCount: 30 },
  { id: "last90", label: "Last 90 days", dayCount: 90 },
];

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export function shiftIsoDate(isoDate: string, dayDelta: number): string {
  const base = new Date(`${isoDate}T00:00:00.000Z`);
  return new Date(base.getTime() + dayDelta * MILLISECONDS_PER_DAY).toISOString().slice(0, 10);
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isDateRangePresetId(candidate: string | null): candidate is DateRangePresetId {
  return candidate === "last7" || candidate === "last30" || candidate === "last90";
}

export function resolveDateRangePreset(presetId: DateRangePresetId, todayIso: string): DateRange {
  const preset = DATE_RANGE_PRESETS.find((entry) => entry.id === presetId);
  const dayCount = preset?.dayCount ?? 30;
  return {
    startDate: shiftIsoDate(todayIso, -(dayCount - 1)),
    endDate: todayIso,
  };
}

export function isValidIsoDate(candidate: string | null): candidate is string {
  if (candidate === null || !/^\d{4}-\d{2}-\d{2}$/.test(candidate)) {
    return false;
  }
  const parsed = new Date(`${candidate}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(candidate);
}
