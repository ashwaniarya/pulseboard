import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Input } from "./input";

describe("Input", () => {
  it("associates label, description and error through aria", () => {
    render(
      <Input
        label="Search calls"
        description="Matches caller names"
        errorMessage="Try a longer search"
        invalid
      />,
    );
    const input = screen.getByRole("textbox", { name: "Search calls" });
    expect(input).toHaveAccessibleDescription("Matches caller names Try a longer search");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("omits the error wiring when valid", () => {
    render(<Input label="Search calls" description="Matches caller names" />);
    const input = screen.getByRole("textbox", { name: "Search calls" });
    expect(input).toHaveAccessibleDescription("Matches caller names");
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("forwards typing to onChange", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Input label="Search calls" onChange={handleChange} />);
    await user.type(screen.getByRole("textbox"), "smith");
    expect(handleChange).toHaveBeenCalled();
  });
});
