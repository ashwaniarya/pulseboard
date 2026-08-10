import type { LocationId } from "../../domain";
import { problemResponse, type ProblemInput } from "./problemResponse";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type QueryParseResult<T> = { ok: true; value: T } | { ok: false; problem: ProblemInput };

function invalidParameter(detail: string): { ok: false; problem: ProblemInput } {
  return {
    ok: false,
    problem: {
      status: 400,
      title: "Invalid query parameter",
      detail,
      typeSlug: "invalid-parameter",
    },
  };
}

function isRealIsoDate(candidate: string): boolean {
  if (!ISO_DATE_PATTERN.test(candidate)) {
    return false;
  }
  const parsed = new Date(`${candidate}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(candidate);
}

export interface DateRangeParams {
  startDate: string;
  endDate: string;
}

export function parseDateRangeParams(url: URL): QueryParseResult<DateRangeParams> {
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");
  if (startDate === null || endDate === null) {
    return invalidParameter("Both startDate and endDate are required, formatted as YYYY-MM-DD.");
  }
  if (!isRealIsoDate(startDate)) {
    return invalidParameter(`startDate "${startDate}" is not a valid YYYY-MM-DD date.`);
  }
  if (!isRealIsoDate(endDate)) {
    return invalidParameter(`endDate "${endDate}" is not a valid YYYY-MM-DD date.`);
  }
  if (startDate > endDate) {
    return invalidParameter(`startDate ${startDate} must not be after endDate ${endDate}.`);
  }
  return { ok: true, value: { startDate, endDate } };
}

export function parseLocationIdsParam(
  url: URL,
  validLocationIds: ReadonlySet<LocationId>,
): QueryParseResult<LocationId[]> {
  const rawValue = url.searchParams.get("locationIds");
  if (rawValue === null || rawValue.trim() === "") {
    return { ok: true, value: [] };
  }
  const requestedIds = rawValue.split(",").map((id) => id.trim());
  const unknownId = requestedIds.find((id) => !validLocationIds.has(id));
  if (unknownId !== undefined) {
    return invalidParameter(`locationIds contains an unknown location "${unknownId}".`);
  }
  return { ok: true, value: requestedIds };
}

export function parseEnumListParam<T extends string>(
  url: URL,
  parameterName: string,
  allowedValues: readonly T[],
): QueryParseResult<T[]> {
  const rawValue = url.searchParams.get(parameterName);
  if (rawValue === null || rawValue.trim() === "") {
    return { ok: true, value: [] };
  }
  const requestedValues = rawValue.split(",").map((value) => value.trim());
  const allowed = new Set<string>(allowedValues);
  const unknownValue = requestedValues.find((value) => !allowed.has(value));
  if (unknownValue !== undefined) {
    return invalidParameter(
      `${parameterName} contains an unknown value "${unknownValue}". Allowed: ${allowedValues.join(", ")}.`,
    );
  }
  return { ok: true, value: requestedValues as T[] };
}

export function problemResponseFor(result: { problem: ProblemInput }) {
  return problemResponse(result.problem);
}
