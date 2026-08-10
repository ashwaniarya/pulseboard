import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";

import { Button } from "../button/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

const meta = {
  title: "Primitives/Dialog",
  component: Dialog,
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FocusManagement: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Clear saved view</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Clear saved view</DialogTitle>
        <DialogDescription>This removes the saved filters for everyone.</DialogDescription>
        <div className="flex justify-end gap-2 pt-2">
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button variant="destructive">Clear view</Button>
        </div>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Clear saved view" });
    await userEvent.click(trigger);
    const dialog = await screen.findByRole("dialog", { name: "Clear saved view" });
    await expect(dialog).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await waitFor(async () => {
      await expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    await expect(trigger).toHaveFocus();
  },
};
