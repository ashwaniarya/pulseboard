import { http, HttpResponse } from "msw";

import { getActiveDataset } from "../data/dataset";

export const locationHandlers = [
  http.get("*/api/v1/locations", () => {
    const dataset = getActiveDataset();
    return HttpResponse.json({ data: dataset.locations });
  }),
];
