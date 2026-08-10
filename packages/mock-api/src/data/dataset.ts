import type { CallRecord, ClinicLocation, DailyLocationMetrics } from "../domain";
import { resolveAnomalyCalendar, type AnomalyWindow } from "./anomalies";
import { formatIsoDate, listDatesEndingAt, shiftIsoDate } from "./dateMath";
import { generateCallRecordsForDay } from "./generateCallRecords";
import { generateDailyMetricsForDay } from "./generateDailyMetrics";
import { CLINIC_LOCATIONS } from "./locations";

export const DEFAULT_DATASET_DAY_COUNT = 90;

export interface PulseboardDataset {
  startDate: string;
  endDate: string;
  dayCount: number;
  locations: readonly ClinicLocation[];
  anomalyWindows: readonly AnomalyWindow[];
  dailyMetrics: DailyLocationMetrics[];
  callRecords: CallRecord[];
}

export interface GenerateDatasetOptions {
  endDate: string;
  dayCount?: number;
  includeAnomalies?: boolean;
}

export function generateDataset(options: GenerateDatasetOptions): PulseboardDataset {
  const dayCount = options.dayCount ?? DEFAULT_DATASET_DAY_COUNT;
  const includeAnomalies = options.includeAnomalies ?? true;
  const anomalyCalendar = includeAnomalies ? resolveAnomalyCalendar(options.endDate) : null;
  const dates = listDatesEndingAt(options.endDate, dayCount);
  const dailyMetrics: DailyLocationMetrics[] = [];
  const callRecords: CallRecord[] = [];
  for (const date of dates) {
    for (const location of CLINIC_LOCATIONS) {
      const volumeMultiplier = anomalyCalendar?.callVolumeMultiplierFor(location.id, date) ?? 1;
      const generatedRecords = generateCallRecordsForDay(location, date, volumeMultiplier);
      const recordsForDay =
        anomalyCalendar?.transformCallRecords(generatedRecords, date) ?? generatedRecords;
      callRecords.push(...recordsForDay);
      const metricsForDay = generateDailyMetricsForDay(location, date, recordsForDay);
      dailyMetrics.push(anomalyCalendar?.transformDailyMetrics(metricsForDay) ?? metricsForDay);
    }
  }
  return {
    startDate: shiftIsoDate(options.endDate, -(dayCount - 1)),
    endDate: options.endDate,
    dayCount,
    locations: CLINIC_LOCATIONS,
    anomalyWindows: anomalyCalendar?.windows ?? [],
    dailyMetrics,
    callRecords,
  };
}

let activeDataset: PulseboardDataset | null = null;

export function configureDataset(options: GenerateDatasetOptions): PulseboardDataset {
  activeDataset = generateDataset(options);
  return activeDataset;
}

export function getActiveDataset(): PulseboardDataset {
  activeDataset ??= generateDataset({ endDate: formatIsoDate(new Date()) });
  return activeDataset;
}
