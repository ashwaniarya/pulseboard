import { getActiveDataset } from "@pulseboard/mock-api/data";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { formatCount } from "../../lib/formatters";
import { renderDashboardAt, TEST_TODAY } from "../../test/renderWithProviders";

function expectedAnsweredTotal(startDate: string, endDate: string): number {
  return getActiveDataset()
    .dailyMetrics.filter((row) => row.date >= startDate && row.date <= endDate)
    .reduce((sum, row) => sum + row.calls.answered, 0);
}

describe("OverviewPage", () => {
  it("shows loading tiles before data arrives", async () => {
    renderDashboardAt("/");
    const busyTiles = await screen.findAllByLabelText("Loading key metrics");
    expect(busyTiles.length).toBeGreaterThan(0);
  });

  it("renders KPI values that reconcile with the seeded dataset", async () => {
    renderDashboardAt("/?range=last30");
    const expectedAnswered = expectedAnsweredTotal("2026-07-12", TEST_TODAY);
    const answeredValue = await screen.findByText(formatCount(expectedAnswered), undefined, {
      timeout: 5000,
    });
    expect(answeredValue).toBeInTheDocument();
    expect(await screen.findByText("Calls answered")).toBeInTheDocument();
    expect(screen.getByText("Missed calls")).toBeInTheDocument();
    expect(screen.getByText("No-show rate")).toBeInTheDocument();
    expect(screen.getByText("Avg rating")).toBeInTheDocument();
    expect(screen.getByText("Revenue collected")).toBeInTheDocument();
    expect(screen.getByText("Appointments completed")).toBeInTheDocument();
  });
});
