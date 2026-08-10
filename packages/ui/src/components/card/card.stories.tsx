import type { Meta, StoryObj } from "@storybook/react-vite";

import { Card } from "./card";

const meta = {
  title: "Primitives/Card",
  component: Card,
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div className="max-w-sm space-y-1">
        <h3 className="text-sm font-semibold">Calls answered</h3>
        <p className="numeric-data text-3xl">1,184</p>
        <p className="text-sm text-text-muted">Across 12 locations this week</p>
      </div>
    ),
  },
};

export const FlushContent: Story = {
  args: {
    padding: "none",
    children: <div className="h-24 w-64 dot-grid-canvas rounded-large" />,
  },
};
