const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

function parseIsoDate(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00.000Z`);
}

export function formatIsoDate(date: Date): string {
  const isoDate = date.toISOString().slice(0, 10);
  return isoDate;
}

export function shiftIsoDate(isoDate: string, dayDelta: number): string {
  const shifted = new Date(parseIsoDate(isoDate).getTime() + dayDelta * MILLISECONDS_PER_DAY);
  return formatIsoDate(shifted);
}

export function dayOfWeekIndex(isoDate: string): number {
  return parseIsoDate(isoDate).getUTCDay();
}

export function daysBetween(earlierIsoDate: string, laterIsoDate: string): number {
  return Math.round(
    (parseIsoDate(laterIsoDate).getTime() - parseIsoDate(earlierIsoDate).getTime()) /
      MILLISECONDS_PER_DAY,
  );
}

export function listDatesEndingAt(endDate: string, dayCount: number): string[] {
  return Array.from({ length: dayCount }, (_unusedValue, index) =>
    shiftIsoDate(endDate, index - (dayCount - 1)),
  );
}
