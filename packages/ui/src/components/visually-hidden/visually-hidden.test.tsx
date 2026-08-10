import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { VisuallyHidden } from "./visually-hidden";

describe("VisuallyHidden", () => {
  it("keeps text in the accessibility tree", () => {
    render(
      <button type="button">
        <VisuallyHidden>Close dialog</VisuallyHidden>
      </button>,
    );
    expect(screen.getByRole("button", { name: "Close dialog" })).toBeInTheDocument();
  });
});
