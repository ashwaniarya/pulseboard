import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { IconButton } from "./icon-button";

function GearIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" width="16" height="16">
      <circle cx="8" cy="8" r="6" fill="currentColor" />
    </svg>
  );
}

describe("IconButton", () => {
  it("always exposes an accessible name from the label prop", () => {
    render(
      <IconButton label="Open settings">
        <GearIcon />
      </IconButton>,
    );
    expect(screen.getByRole("button", { name: "Open settings" })).toBeInTheDocument();
  });
});
