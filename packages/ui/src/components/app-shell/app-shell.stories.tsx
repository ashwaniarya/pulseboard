import type { Meta, StoryObj } from "@storybook/react-vite";

import { Badge } from "../badge/badge";
import { ThemeToggle } from "../../theme/theme-toggle";
import { AppShell, Sidebar, SidebarNavItem } from "./app-shell";

function OverviewIcon() {
  return (
    <svg viewBox="0 0 18 18" width="16" height="16" fill="none">
      <rect x="2" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="10" y="2" width="6" height="9" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="2" y="10" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
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

const meta = {
  title: "Shell/AppShell",
  component: AppShell,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DashboardLayout: Story = {
  args: { sidebar: null, children: null },
  render: () => (
    <AppShell
      sidebar={
        <Sidebar footer={<Badge tone="accent">Demo data</Badge>}>
          <SidebarNavItem label="Overview" icon={<OverviewIcon />} isActive />
          <SidebarNavItem label="Calls" icon={<CallsIcon />} />
          <SidebarNavItem label="Locations" icon={<OverviewIcon />} />
        </Sidebar>
      }
      topbar={
        <div className="flex flex-1 items-center justify-between gap-2">
          <h1 className="text-sm font-semibold">Overview</h1>
          <ThemeToggle />
        </div>
      }
    >
      <div className="p-6">
        <div className="rounded-large border border-dashed border-outline-strong bg-surface-raised/60 p-10 text-center text-sm text-text-muted">
          Page content renders here
        </div>
      </div>
    </AppShell>
  ),
};
