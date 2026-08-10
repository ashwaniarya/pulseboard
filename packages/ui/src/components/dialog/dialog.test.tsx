import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./dialog";

describe("Dialog", () => {
  it("exposes an accessible dialog with title and description when open", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Clear saved view</DialogTitle>
          <DialogDescription>This removes the saved filters for everyone.</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    const dialog = screen.getByRole("dialog", { name: "Clear saved view" });
    expect(dialog).toHaveAccessibleDescription("This removes the saved filters for everyone.");
  });
});
