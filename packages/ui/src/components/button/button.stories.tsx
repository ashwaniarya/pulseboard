import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { Button } from "./button";

const meta = {
  title: "Primitives/Button",
  component: Button,
  args: {
    children: "Save changes",
    onClick: fn(),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: { variant: "secondary", children: "Export report" },
};

export const Ghost: Story = {
  args: { variant: "ghost", children: "Dismiss" },
};

export const Destructive: Story = {
  args: { variant: "destructive", children: "Delete saved view" },
};

export const Small: Story = {
  args: { size: "small", children: "Apply" },
};

export const Loading: Story = {
  args: { isLoading: true },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");
    await expect(button).toHaveAttribute("aria-busy", "true");
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const KeyboardActivation: Story = {
  args: { children: "Focus me" },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole("button").focus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
