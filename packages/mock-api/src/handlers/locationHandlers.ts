import { http, HttpResponse } from "msw";

import { getActiveDataset } from "../data/dataset";
import { applyScenarioDelay, maybeScenarioFailure } from "../scenarios";

export const locationHandlers = [
  http.get("*/api/v1/locations", async () => {
    await applyScenarioDelay();
    const failure = maybeScenarioFailure("other");
    if (failure !== null) {
      return failure;
    }
    const dataset = getActiveDataset();
    return HttpResponse.json({ data: dataset.locations });
  }),
];
