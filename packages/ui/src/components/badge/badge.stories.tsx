import type { Meta, StoryObj } from "@storybook/react-vite";

import { Badge } from "./badge";

const meta = {
  title: "Primitives/Badge",
  component: Badge,
  args: { children: "Steady" },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {};
export const Positive: Story = { args: { tone: "positive", children: "+12% vs last period" } };
export const Negative: Story = { args: { tone: "negative", children: "-8% vs last period" } };
export const Warning: Story = { args: { tone: "warning", children: "Watch no-shows" } };
export const Accent: Story = { args: { tone: "accent", children: "Live" } };
