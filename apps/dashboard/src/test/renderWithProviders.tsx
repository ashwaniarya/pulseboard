import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router";

import { filtersHydratedFromUrl } from "../features/filters/filtersSlice";
import { parseFiltersFromUrl } from "../features/filters/urlSync";
import { createDashboardTestRouter } from "../app/router";
import { createDashboardStore } from "../app/store";

export const TEST_TODAY = "2026-08-10";

export function renderDashboardAt(initialPath: string) {
  const store = createDashboardStore();
  const [, search = ""] = initialPath.split("?");
  store.dispatch(filtersHydratedFromUrl(parseFiltersFromUrl(search, TEST_TODAY)));
  const router = createDashboardTestRouter([initialPath]);
  const view = render(
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>,
  );
  return { store, router, view };
}
