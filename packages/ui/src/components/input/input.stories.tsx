import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { Input } from "./input";

const meta = {
  title: "Primitives/Input",
  component: Input,
  args: {
    label: "Search calls",
    placeholder: "Caller name…",
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDescription: Story = {
  args: { description: "Matches caller names in the selected range" },
};

export const WithError: Story = {
  args: {
    invalid: true,
    errorMessage: "Try at least two characters",
    description: "Matches caller names",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Search calls" });
    await expect(input).toHaveAccessibleDescription(
      "Matches caller names Try at least two characters",
    );
    await userEvent.type(input, "sm");
    await expect(input).toHaveValue("sm");
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};
