import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, screen, userEvent, within } from "storybook/test";

import { MultiSelect, type MultiSelectOption } from "./multi-select";

const LOCATION_OPTIONS: MultiSelectOption[] = [
  { value: "loc-cedar-park", label: "Cedar Park Dental" },
  { value: "loc-lakeview", label: "Lakeview Smiles" },
  { value: "loc-sunrise-mesa", label: "Sunrise Mesa Dental" },
  { value: "loc-palm-court", label: "Palm Court Dentistry" },
];

function ControlledMultiSelect() {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  return (
    <MultiSelect
      label="Locations"
      options={LOCATION_OPTIONS}
      selectedValues={selectedValues}
      onSelectionChange={setSelectedValues}
      emptySelectionSummary="All locations"
    />
  );
}

const meta = {
  title: "Patterns/MultiSelect",
  component: MultiSelect,
} satisfies Meta<typeof MultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SelectionFlow: Story = {
  args: {
    label: "Locations",
    options: LOCATION_OPTIONS,
    selectedValues: [],
    onSelectionChange: () => undefined,
  },
  render: () => <ControlledMultiSelect />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Locations: All locations" }));

    const cedarPark = await screen.findByRole("option", { name: "Cedar Park Dental" });
    await userEvent.click(cedarPark);
    await expect(cedarPark).toHaveAttribute("aria-selected", "true");

    await userEvent.click(screen.getByRole("option", { name: "Lakeview Smiles" }));
    await expect(
      canvas.getByRole("button", { name: "Locations: 2 of 4 selected" }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Select all" }));
    await expect(
      canvas.getByRole("button", { name: "Locations: 4 of 4 selected" }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Clear" }));
    await expect(
      canvas.getByRole("button", { name: "Locations: All locations" }),
    ).toBeInTheDocument();
  },
};
