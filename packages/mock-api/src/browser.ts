import { setupWorker } from "msw/browser";

import { configureDataset } from "./data/dataset";
import { formatIsoDate } from "./data/dateMath";
import { allHandlers } from "./handlers/index";
import {
  SCENARIO_STORAGE_KEY,
  isScenarioKey,
  resolveScenarioKey,
  setActiveScenario,
} from "./scenarios";

export function createMockApiWorker() {
  return setupWorker(...allHandlers);
}

export async function startMockApi(): Promise<void> {
  const searchParams = new URLSearchParams(window.location.search);

  const requestedEndDate = searchParams.get("datasetEndDate");
  const endDate =
    requestedEndDate !== null && /^\d{4}-\d{2}-\d{2}$/.test(requestedEndDate)
      ? requestedEndDate
      : formatIsoDate(new Date());
  configureDataset({ endDate });

  const scenarioKey = resolveScenarioKey({
    queryString: window.location.search,
    storedValue: window.localStorage.getItem(SCENARIO_STORAGE_KEY),
  });
  setActiveScenario(scenarioKey);
  const queryScenario = searchParams.get("apiScenario");
  if (isScenarioKey(queryScenario)) {
    window.localStorage.setItem(SCENARIO_STORAGE_KEY, queryScenario);
  }

  const worker = createMockApiWorker();
  await worker.start({
    onUnhandledRequest: "bypass",
    serviceWorker: { url: "/mockServiceWorker.js" },
  });
}
