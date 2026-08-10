import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { Button } from "../button/button";
import { Sparkline } from "../sparkline/sparkline";
import { ChartCard } from "./chart-card";

const meta = {
  title: "Patterns/ChartCard",
  component: ChartCard,
  args: {
    title: "Call volume",
    subtitle: "Answered vs missed across the fleet",
    className: "w-[28rem]",
  },
} satisfies Meta<typeof ChartCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ready: Story = {
  args: {
    toolbar: (
      <Button size="small" variant="ghost">
        Export
      </Button>
    ),
    children: (
      <div className="px-2">
        <Sparkline values={[42, 51, 48, 63, 58, 71, 69, 77]} className="h-40" />
      </div>
    ),
  },
};

export const Loading: Story = {
  args: { status: "loading" },
};

export const Empty: Story = {
  args: { status: "empty" },
};

export const ErrorWithRetry: Story = {
  args: { status: "error", onRetry: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Try again" }));
    await expect(args.onRetry).toHaveBeenCalledTimes(1);
  },
};
