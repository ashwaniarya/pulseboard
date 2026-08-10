import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./button";

describe("Button", () => {
  it("defaults to type button so it never submits forms accidentally", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("type", "button");
  });

  it("fires onClick from keyboard activation", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Save</Button>);
    await user.tab();
    await user.keyboard("{Enter}");
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("announces loading and suppresses clicks while busy", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <Button isLoading onClick={handleClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-busy", "true");
    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("keeps the label in the layout while loading so width stays stable", () => {
    render(<Button isLoading>Save changes</Button>);
    expect(screen.getByText("Save changes")).toBeInTheDocument();
  });
});
