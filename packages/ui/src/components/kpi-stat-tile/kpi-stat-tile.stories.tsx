import type { Meta, StoryObj } from "@storybook/react-vite";

import { Sparkline } from "../sparkline/sparkline";
import { KpiStatTile } from "./kpi-stat-tile";

const WEEK_OF_CALLS = [48, 52, 61, 57, 66, 71, 69];
const WEEK_OF_NO_SHOWS = [9.1, 8.4, 8.8, 7.9, 7.2, 6.8, 6.2];

const meta = {
  title: "Patterns/KpiStatTile",
  component: KpiStatTile,
} satisfies Meta<typeof KpiStatTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GrowthIsGood: Story = {
  args: {
    label: "Calls answered",
    value: "1,184",
    delta: { percentText: "12%", direction: "up", sentiment: "positive" },
    sparkline: <Sparkline values={WEEK_OF_CALLS} />,
    className: "w-64",
  },
};

export const DownIsGood: Story = {
  args: {
    label: "No-show rate",
    value: "6.2%",
    delta: { percentText: "1.4%", direction: "down", sentiment: "positive" },
    sparkline: <Sparkline values={WEEK_OF_NO_SHOWS} className="text-positive" />,
    className: "w-64",
  },
};

export const UpIsBad: Story = {
  args: {
    label: "Missed calls",
    value: "218",
    delta: { percentText: "9%", direction: "up", sentiment: "negative" },
    sparkline: <Sparkline values={[14, 18, 17, 22, 26, 25, 31]} className="text-negative" />,
    className: "w-64",
  },
};

export const Loading: Story = {
  args: {
    label: "Revenue",
    value: "",
    isLoading: true,
    className: "w-64",
  },
};
