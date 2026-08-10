import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor } from "storybook/test";

import { Button } from "../button/button";
import { Tooltip } from "./tooltip";

const meta = {
  title: "Primitives/Tooltip",
  component: Tooltip,
  args: {
    content: "Weighted across the selected locations",
    children: <Button variant="secondary">Average rating</Button>,
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RevealsOnFocus: Story = {
  play: async () => {
    await userEvent.tab();
    await waitFor(async () => {
      const tooltips = document.querySelectorAll("[data-radix-popper-content-wrapper]");
      await expect(tooltips.length).toBeGreaterThan(0);
    });
  },
};
