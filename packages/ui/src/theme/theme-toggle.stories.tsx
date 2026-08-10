import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { ThemeToggle } from "./theme-toggle";

const meta = {
  title: "Patterns/ThemeToggle",
  component: ThemeToggle,
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FlipsTheme: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    document.documentElement.dataset.theme = "light";
    const toggle = canvas.getByRole("button", { name: "Switch to dark theme" });
    await userEvent.click(toggle);
    await waitFor(async () => {
      await expect(document.documentElement.dataset.theme).toBe("dark");
    });
    await expect(canvas.getByRole("button", { name: "Switch to light theme" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Switch to light theme" }));
    await waitFor(async () => {
      await expect(document.documentElement.dataset.theme).toBe("light");
    });
  },
};
