import type { CallRecord, ClinicLocation, DailyLocationMetrics } from "../domain";
import { listDatesEndingAt, shiftIsoDate } from "./dateMath";
import { generateCallRecordsForDay } from "./generateCallRecords";
import { generateDailyMetricsForDay } from "./generateDailyMetrics";
import { CLINIC_LOCATIONS } from "./locations";

export const DEFAULT_DATASET_DAY_COUNT = 90;

export interface PulseboardDataset {
  startDate: string;
  endDate: string;
  dayCount: number;
  locations: readonly ClinicLocation[];
  dailyMetrics: DailyLocationMetrics[];
  callRecords: CallRecord[];
}

export interface GenerateDatasetOptions {
  endDate: string;
  dayCount?: number;
}

export function generateDataset(options: GenerateDatasetOptions): PulseboardDataset {
  const dayCount = options.dayCount ?? DEFAULT_DATASET_DAY_COUNT;
  const dates = listDatesEndingAt(options.endDate, dayCount);
  const dailyMetrics: DailyLocationMetrics[] = [];
  const callRecords: CallRecord[] = [];
  for (const date of dates) {
    for (const location of CLINIC_LOCATIONS) {
      const recordsForDay = generateCallRecordsForDay(location, date);
      callRecords.push(...recordsForDay);
      dailyMetrics.push(generateDailyMetricsForDay(location, date, recordsForDay));
    }
  }
  return {
    startDate: shiftIsoDate(options.endDate, -(dayCount - 1)),
    endDate: options.endDate,
    dayCount,
    locations: CLINIC_LOCATIONS,
    dailyMetrics,
    callRecords,
  };
}
