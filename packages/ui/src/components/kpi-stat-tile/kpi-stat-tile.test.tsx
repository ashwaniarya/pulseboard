import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { KpiStatTile } from "./kpi-stat-tile";

describe("KpiStatTile", () => {
  it("renders label, value and a screen-reader delta sentence", () => {
    render(
      <KpiStatTile
        label="No-show rate"
        value="6.2%"
        delta={{ percentText: "1.4%", direction: "down", sentiment: "positive" }}
      />,
    );
    expect(screen.getByText("No-show rate")).toBeInTheDocument();
    expect(screen.getByText("6.2%")).toBeInTheDocument();
    expect(screen.getByText("down 1.4% versus the previous period")).toBeInTheDocument();
  });

  it("keeps the tile height while loading", () => {
    const { container } = render(<KpiStatTile label="Revenue" value="" isLoading />);
    const tile = container.firstElementChild;
    expect(tile).toHaveAttribute("aria-busy", "true");
    expect(tile?.className).toContain("h-[7.5rem]");
  });
});
