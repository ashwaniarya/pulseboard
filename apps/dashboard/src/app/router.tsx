import { createBrowserRouter, createMemoryRouter, type RouteObject } from "react-router";

import { AppShellLayout } from "../components/layout/AppShellLayout";
import { NotFoundPage } from "../components/layout/NotFoundPage";
import { RouteErrorFallback } from "../components/layout/RouteErrorFallback";

export const dashboardRoutes: RouteObject[] = [
  {
    path: "/",
    Component: AppShellLayout,
    ErrorBoundary: RouteErrorFallback,
    children: [
      { index: true, lazy: () => import("../features/overview/OverviewPage") },
      { path: "calls", lazy: () => import("../features/calls/CallsPage") },
      { path: "locations", lazy: () => import("../features/locations/LocationsComparePage") },
      { path: "benchmark/table", lazy: () => import("../features/benchmark/TableBenchmarkPage") },
      { path: "*", Component: NotFoundPage },
    ],
  },
];

export function createDashboardRouter() {
  return createBrowserRouter(dashboardRoutes);
}

export function createDashboardTestRouter(initialEntries: string[]) {
  return createMemoryRouter(dashboardRoutes, { initialEntries });
}
