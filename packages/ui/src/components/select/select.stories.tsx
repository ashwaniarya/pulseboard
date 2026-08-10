import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { Select } from "./select";

const meta = {
  title: "Primitives/Select",
  component: Select,
  args: {
    label: "Sort by",
    defaultValue: "startedAt",
    children: (
      <>
        <option value="startedAt">Newest first</option>
        <option value="waitSeconds">Longest wait</option>
        <option value="durationSeconds">Longest call</option>
      </>
    ),
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole("combobox", { name: "Sort by" });
    await userEvent.selectOptions(select, "waitSeconds");
    await expect(select).toHaveValue("waitSeconds");
  },
};

export const HiddenLabel: Story = {
  args: { hideLabel: true },
};
