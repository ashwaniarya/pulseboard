import { healthHandlers } from "./healthHandlers";
import { locationHandlers } from "./locationHandlers";
import { metricsHandlers } from "./metricsHandlers";

export const allHandlers = [...locationHandlers, ...metricsHandlers, ...healthHandlers];
