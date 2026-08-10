import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderDashboardAt } from "../../test/renderWithProviders";

describe("LocationsComparePage", () => {
  it("compares the first three offices by default with a scorecard", async () => {
    renderDashboardAt("/locations?range=last30");
    await waitFor(
      () => {
        expect(screen.getByText("Office scorecard")).toBeInTheDocument();
        expect(screen.getAllByRole("row").length).toBeGreaterThanOrEqual(4);
      },
      { timeout: 5000 },
    );
    expect(screen.getByText("Cedar Park Dental")).toBeInTheDocument();
    expect(screen.getAllByText("Answered").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Missed").length).toBeGreaterThan(0);
  });
});
