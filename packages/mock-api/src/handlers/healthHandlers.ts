import { http, HttpResponse } from "msw";

import { DATASET_SEED_VERSION } from "../domain";
import { getActiveDataset } from "../data/dataset";
import { applyScenarioDelay, maybeScenarioFailure } from "../scenarios";

export const healthHandlers = [
  http.get("*/api/v1/health", async () => {
    await applyScenarioDelay();
    const failure = maybeScenarioFailure("other");
    if (failure !== null) {
      return failure;
    }
    const dataset = getActiveDataset();
    return HttpResponse.json({
      data: {
        status: "ok",
        generatedAt: dataset.endDate,
        datasetSeedVersion: DATASET_SEED_VERSION,
        dayCount: dataset.dayCount,
        recordCounts: {
          callRecords: dataset.callRecords.length,
          dailyMetrics: dataset.dailyMetrics.length,
        },
      },
    });
  }),
];
