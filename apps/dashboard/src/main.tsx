import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router";

import { startMockApi } from "@pulseboard/mock-api/browser";

import { initializeSentryIfConfigured } from "./observability/sentry";

import { filtersHydratedFromUrl } from "./features/filters/filtersSlice";
import { parseFiltersFromUrl } from "./features/filters/urlSync";
import { todayIsoDate } from "./lib/dateRange";
import { createDashboardRouter } from "./app/router";
import { createDashboardStore } from "./app/store";
import "./styles/app.css";

async function bootDashboard(): Promise<void> {
  initializeSentryIfConfigured(import.meta.env.VITE_SENTRY_DSN as string | undefined);
  await startMockApi();
  const store = createDashboardStore();
  store.dispatch(
    filtersHydratedFromUrl(parseFiltersFromUrl(window.location.search, todayIsoDate())),
  );
  const rootElement = document.getElementById("root");
  if (rootElement === null) {
    throw new Error("Missing #root element");
  }
  createRoot(rootElement).render(
    <StrictMode>
      <Provider store={store}>
        <RouterProvider router={createDashboardRouter()} />
      </Provider>
    </StrictMode>,
  );
}

void bootDashboard();
