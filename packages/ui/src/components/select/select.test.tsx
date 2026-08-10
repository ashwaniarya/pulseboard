import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Select } from "./select";

describe("Select", () => {
  it("exposes a labelled combobox with options", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Select label="Sort by" onChange={handleChange} defaultValue="startedAt">
        <option value="startedAt">Newest first</option>
        <option value="waitSeconds">Longest wait</option>
      </Select>,
    );
    const select = screen.getByRole("combobox", { name: "Sort by" });
    await user.selectOptions(select, "waitSeconds");
    expect(handleChange).toHaveBeenCalled();
    expect(select).toHaveValue("waitSeconds");
  });
});
