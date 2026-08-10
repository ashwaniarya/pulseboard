import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, screen, userEvent, within } from "storybook/test";

import {
  DateRangePicker,
  type DateRangePickerPreset,
  type DateRangeValue,
} from "./date-range-picker";

const PRESETS: DateRangePickerPreset[] = [
  { id: "last7", label: "Last 7 days", range: { startDate: "2026-08-04", endDate: "2026-08-10" } },
  {
    id: "last30",
    label: "Last 30 days",
    range: { startDate: "2026-07-12", endDate: "2026-08-10" },
  },
  {
    id: "last90",
    label: "Last 90 days",
    range: { startDate: "2026-05-13", endDate: "2026-08-10" },
  },
];

function ControlledDateRangePicker() {
  const [value, setValue] = useState<DateRangeValue>(
    PRESETS[1]?.range ?? { startDate: "", endDate: "" },
  );
  const [activePresetId, setActivePresetId] = useState<string | null>("last30");
  return (
    <DateRangePicker
      value={value}
      presets={PRESETS}
      activePresetId={activePresetId}
      onRangeChange={(nextRange, presetId) => {
        setValue(nextRange);
        setActivePresetId(presetId);
      }}
    />
  );
}

const meta = {
  title: "Patterns/DateRangePicker",
  component: DateRangePicker,
} satisfies Meta<typeof DateRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PresetSelection: Story = {
  args: {
    value: PRESETS[1]?.range ?? { startDate: "", endDate: "" },
    presets: PRESETS,
    onRangeChange: () => undefined,
  },
  render: () => <ControlledDateRangePicker />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Date range: Last 30 days" }));
    await expect(await screen.findByRole("grid")).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "Last 7 days" }));
    await expect(
      canvas.getByRole("button", { name: "Date range: Last 7 days" }),
    ).toBeInTheDocument();
  },
};
