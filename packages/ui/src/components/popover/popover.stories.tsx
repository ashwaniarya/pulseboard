import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, within } from "storybook/test";

import { Button } from "../button/button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

const meta = {
  title: "Primitives/Popover",
  component: Popover,
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OpensFromTrigger: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary">Filter locations</Button>
      </PopoverTrigger>
      <PopoverContent label="Location filter">
        <p className="text-sm">Popover body content</p>
      </PopoverContent>
    </Popover>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Filter locations" }));
    await expect(await screen.findByText("Popover body content")).toBeVisible();
  },
};
