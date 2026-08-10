import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { MultiSelect } from "./multi-select";

const LOCATION_OPTIONS = [
  { value: "loc-cedar-park", label: "Cedar Park Dental" },
  { value: "loc-lakeview", label: "Lakeview Smiles" },
  { value: "loc-palm-court", label: "Palm Court Dentistry" },
];

describe("MultiSelect", () => {
  it("summarises an empty selection with the provided wording", () => {
    render(
      <MultiSelect
        label="Locations"
        options={LOCATION_OPTIONS}
        selectedValues={[]}
        onSelectionChange={vi.fn()}
        emptySelectionSummary="All locations"
      />,
    );
    expect(screen.getByRole("button", { name: "Locations: All locations" })).toBeInTheDocument();
  });

  it("toggles a value into the selection", async () => {
    const user = userEvent.setup();
    const handleSelectionChange = vi.fn();
    render(
      <MultiSelect
        label="Locations"
        options={LOCATION_OPTIONS}
        selectedValues={["loc-lakeview"]}
        onSelectionChange={handleSelectionChange}
      />,
    );
    await user.click(screen.getByRole("button", { name: /Locations/ }));
    const listbox = await screen.findByRole("listbox", { name: "Locations" });
    expect(listbox).toHaveAttribute("aria-multiselectable", "true");
    expect(screen.getByRole("option", { name: "Lakeview Smiles" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await user.click(screen.getByRole("option", { name: "Cedar Park Dental" }));
    expect(handleSelectionChange).toHaveBeenCalledWith(["loc-lakeview", "loc-cedar-park"]);
  });
});
