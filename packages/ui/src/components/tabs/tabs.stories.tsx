import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { Tab, TabList, TabPanel, Tabs } from "./tabs";

const meta = {
  title: "Primitives/Tabs",
  component: Tabs,
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const KeyboardTraversal: Story = {
  args: { defaultValue: "calls", children: null },
  render: () => (
    <Tabs defaultValue="calls" className="w-96">
      <TabList label="Metric family">
        <Tab value="calls">Calls</Tab>
        <Tab value="appointments">Appointments</Tab>
        <Tab value="reviews">Reviews</Tab>
      </TabList>
      <TabPanel value="calls">Call volume and answer rates.</TabPanel>
      <TabPanel value="appointments">Bookings, completions, no-shows.</TabPanel>
      <TabPanel value="reviews">Ratings across locations.</TabPanel>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const callsTab = canvas.getByRole("tab", { name: "Calls" });
    callsTab.focus();

    await userEvent.keyboard("{ArrowRight}");
    const appointmentsTab = canvas.getByRole("tab", { name: "Appointments" });
    await expect(appointmentsTab).toHaveFocus();
    await expect(appointmentsTab).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByRole("tabpanel", { name: "Appointments" })).toBeVisible();

    await userEvent.keyboard("{End}");
    await expect(canvas.getByRole("tab", { name: "Reviews" })).toHaveFocus();

    await userEvent.keyboard("{ArrowRight}");
    await expect(callsTab).toHaveFocus();

    await userEvent.keyboard("{Home}");
    await expect(callsTab).toHaveFocus();
    await expect(callsTab).toHaveAttribute("aria-selected", "true");
  },
};
