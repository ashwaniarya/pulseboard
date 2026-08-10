import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "./badge";

describe("Badge", () => {
  it("renders its label text", () => {
    render(<Badge tone="positive">Answer rate up</Badge>);
    expect(screen.getByText("Answer rate up")).toBeInTheDocument();
  });
});
