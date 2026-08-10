import { http, HttpResponse } from "msw";

import { DATASET_SEED_VERSION } from "../domain";
import { getActiveDataset } from "../data/dataset";

export const healthHandlers = [
  http.get("*/api/v1/health", () => {
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
