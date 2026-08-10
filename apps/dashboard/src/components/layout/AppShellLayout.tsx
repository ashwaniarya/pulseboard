import { AppShell, Badge, Sidebar, SidebarNavItem, ThemeToggle } from "@pulseboard/ui";
import { NavLink, Outlet, useLocation } from "react-router";

import { ApiStatusBanner } from "../../features/apiHealth/ApiStatusBanner";
import { DemoScenarioMenu } from "../../features/demoControls/DemoScenarioMenu";
import { DateRangeFilterControl } from "../../features/filters/DateRangeFilterControl";
import { LocationFilterControl } from "../../features/filters/LocationFilterControl";

interface NavigationEntry {
  path: string;
  label: string;
  icon: React.ReactNode;
}

function OverviewIcon() {
  return (
    <svg viewBox="0 0 18 18" width="16" height="16" fill="none">
      <rect x="2" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="10" y="2" width="6" height="9" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="2" y="10" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="10" y="13" width="6" height="3" rx="1" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function CallsIcon() {
  return (
    <svg viewBox="0 0 18 18" width="16" height="16" fill="none">
      <path
        d="M3 3.5C3 2.7 3.7 2 4.5 2h1.6c.4 0 .8.3.9.7l.7 2.6a1 1 0 0 1-.5 1.1l-1.2.7a10 10 0 0 0 4.9 4.9l.7-1.2a1 1 0 0 1 1.1-.5l2.6.7c.4.1.7.5.7.9v1.6c0 .8-.7 1.5-1.5 1.5C8.6 16 2 9.4 3 3.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function LocationsIcon() {
  return (
    <svg viewBox="0 0 18 18" width="16" height="16" fill="none">
      <path
        d="M9 16s5.5-4.6 5.5-8.6a5.5 5.5 0 1 0-11 0C3.5 11.4 9 16 9 16Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle cx="9" cy="7.2" r="1.8" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function BenchmarkIcon() {
  return (
    <svg viewBox="0 0 18 18" width="16" height="16" fill="none">
      <path
        d="M2.5 15.5v-5m4.33 5v-9m4.34 9V4.5m4.33 11V8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

const NAVIGATION_ENTRIES: readonly NavigationEntry[] = [
  { path: "/", label: "Overview", icon: <OverviewIcon /> },
  { path: "/calls", label: "Calls", icon: <CallsIcon /> },
  { path: "/locations", label: "Locations", icon: <LocationsIcon /> },
  { path: "/benchmark/table", label: "Benchmark", icon: <BenchmarkIcon /> },
];

const PAGE_TITLES: Record<string, string> = {
  "/": "Overview",
  "/calls": "Calls",
  "/locations": "Locations",
  "/benchmark/table": "Table benchmark",
};

export function AppShellLayout() {
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] ?? "Pulseboard";
  return (
    <AppShell
      sidebar={
        <Sidebar footer={<Badge tone="accent">Demo data</Badge>}>
          {NAVIGATION_ENTRIES.map((entry) => {
            const isActive =
              entry.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(entry.path);
            return (
              <SidebarNavItem
                key={entry.path}
                label={entry.label}
                icon={entry.icon}
                isActive={isActive}
                renderLink={(linkProps) => <NavLink to={entry.path} {...linkProps} />}
              />
            );
          })}
        </Sidebar>
      }
      topbar={
        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-2">
          <h1 className="text-sm font-semibold">{pageTitle}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <DateRangeFilterControl />
            <LocationFilterControl />
            <DemoScenarioMenu />
            <ThemeToggle />
          </div>
        </div>
      }
      banner={<ApiStatusBanner />}
    >
      <Outlet />
    </AppShell>
  );
}
