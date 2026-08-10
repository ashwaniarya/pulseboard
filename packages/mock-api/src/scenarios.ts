import { problemResponse } from "./handlers/shared/problemResponse";

export type ScenarioKey = "healthy" | "slow" | "degraded" | "outage";
export type ScenarioFailureScope = "metrics" | "calls" | "other";

export interface MockApiScenario {
  key: ScenarioKey;
  label: string;
  description: string;
  latency: { minMs: number; maxMs: number };
  failure: {
    mode: "none" | "error-rate" | "outage";
    rate?: number;
    scopes?: readonly ScenarioFailureScope[];
  };
}

export const SCENARIO_PRESETS: Record<ScenarioKey, MockApiScenario> = {
  healthy: {
    key: "healthy",
    label: "Healthy",
    description: "Normal latency, every request succeeds.",
    latency: { minMs: 150, maxMs: 450 },
    failure: { mode: "none" },
  },
  slow: {
    key: "slow",
    label: "Slow network",
    description: "Every request crawls; skeletons and shimmer states stay visible.",
    latency: { minMs: 1200, maxMs: 2500 },
    failure: { mode: "none" },
  },
  degraded: {
    key: "degraded",
    label: "Degraded metrics",
    description: "A quarter of metrics requests fail so retry and banner behaviour shows up.",
    latency: { minMs: 150, maxMs: 450 },
    failure: { mode: "error-rate", rate: 0.25, scopes: ["metrics"] },
  },
  outage: {
    key: "outage",
    label: "Full outage",
    description: "Every endpoint returns errors; the app degrades to cached data.",
    latency: { minMs: 100, maxMs: 200 },
    failure: { mode: "outage" },
  },
};

export const SCENARIO_STORAGE_KEY = "pulseboard.apiScenario";

let activeScenario: MockApiScenario = SCENARIO_PRESETS.healthy;
let latencyEnabled = true;
let randomSource: () => number = Math.random;

export function isScenarioKey(candidate: string | null | undefined): candidate is ScenarioKey {
  return (
    candidate === "healthy" ||
    candidate === "slow" ||
    candidate === "degraded" ||
    candidate === "outage"
  );
}

export function setActiveScenario(key: ScenarioKey): void {
  activeScenario = SCENARIO_PRESETS[key];
}

export function getActiveScenario(): MockApiScenario {
  return activeScenario;
}

export function disableScenarioLatency(): void {
  latencyEnabled = false;
}

export function setScenarioRandomSource(source: () => number): void {
  randomSource = source;
}

export interface ResolveScenarioInput {
  queryString: string;
  storedValue: string | null;
}

export function resolveScenarioKey(input: ResolveScenarioInput): ScenarioKey {
  const queryValue = new URLSearchParams(input.queryString).get("apiScenario");
  if (isScenarioKey(queryValue)) {
    return queryValue;
  }
  if (isScenarioKey(input.storedValue)) {
    return input.storedValue;
  }
  return "healthy";
}

export async function applyScenarioDelay(): Promise<void> {
  if (!latencyEnabled) {
    return;
  }
  const { minMs, maxMs } = activeScenario.latency;
  const delayMs = minMs + randomSource() * (maxMs - minMs);
  await new Promise((resolve) => setTimeout(resolve, delayMs));
}

export function maybeScenarioFailure(scope: ScenarioFailureScope) {
  const { failure } = activeScenario;
  if (failure.mode === "outage") {
    return scenarioFailureResponse();
  }
  if (failure.mode === "error-rate") {
    const scopeMatches = failure.scopes === undefined || failure.scopes.includes(scope);
    if (scopeMatches && randomSource() < (failure.rate ?? 0)) {
      return scenarioFailureResponse();
    }
  }
  return null;
}

function scenarioFailureResponse() {
  return problemResponse({
    status: 503,
    title: "Service temporarily unavailable",
    detail: "The mock API is simulating an upstream failure for this request.",
    typeSlug: "service-unavailable",
  });
}
