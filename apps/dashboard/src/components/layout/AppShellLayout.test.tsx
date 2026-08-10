import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderDashboardAt } from "../../test/renderWithProviders";

describe("AppShellLayout", () => {
  it("renders navigation with the current page marked", async () => {
    renderDashboardAt("/");
    expect(await screen.findByRole("navigation", { name: "Primary" })).toBeInTheDocument();
    const overviewLinks = screen.getAllByRole("link", { name: "Overview" });
    expect(overviewLinks.some((link) => link.getAttribute("aria-current") === "page")).toBe(true);
  });

  it("shows the global date range and location filters", async () => {
    renderDashboardAt("/");
    expect(
      await screen.findByRole("button", { name: "Date range: Last 30 days" }),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Locations: All locations" })).toBeInTheDocument();
    });
  });

  it("routes unknown paths to the not-found page", async () => {
    renderDashboardAt("/nowhere");
    expect(await screen.findByText("There's no page here")).toBeInTheDocument();
  });
});
