import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { percentile } from "./useFrameTimingProbe";
import { renderDashboardAt } from "../../test/renderWithProviders";

describe("percentile", () => {
  it("returns the value at the requested fraction of a sorted list", () => {
    const sorted = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(percentile(sorted, 0.95)).toBe(10);
    expect(percentile(sorted, 0.5)).toBe(5);
    expect(percentile([], 0.95)).toBe(0);
  });
});

describe("TableBenchmarkPage", () => {
  it("generates the full benchmark dataset and reports its size", async () => {
    renderDashboardAt("/benchmark/table");
    const description = await screen.findByText(/in-memory call records/, undefined, {
      timeout: 10000,
    });
    const match = /([\d,]+) in-memory/.exec(description.textContent ?? "");
    const recordCount = Number((match?.[1] ?? "0").replaceAll(",", ""));
    expect(recordCount).toBeGreaterThan(45000);
    expect(screen.getByText("Mount time")).toBeInTheDocument();
    expect(screen.getByText("Rows in DOM")).toBeInTheDocument();
  }, 15000);
});
