import { setupServer } from "msw/node";

import { allHandlers } from "./handlers/index";
import { disableScenarioLatency } from "./scenarios";

export function createMockApiNodeServer() {
  disableScenarioLatency();
  return setupServer(...allHandlers);
}
