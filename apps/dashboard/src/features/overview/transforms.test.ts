import { describe, expect, it } from "vitest";

import { buildDeltaFromComparison, buildKpiTileModels, buildTrendChartModel } from "./transforms";
import type { MetricsTotals } from "./overviewApi";

function totalsWith(overrides: Partial<MetricsTotals>): MetricsTotals {
  return {
    callsAnswered: 1000,
    callsMissed: 120,
    callsVoicemail: 60,
    averageAnswerSeconds: 22,
    appointmentsBooked: 400,
    appointmentsCompleted: 360,
    appointmentsNoShows: 25,
    appointmentsCancellations: 15,
    messagesSent: 800,
    messagesReceived: 900,
    reviewsReceived: 40,
    averageRating: 4.6,
    revenueCollectedCents: 4200000,
    ...overrides,
  };
}

describe("buildDeltaFromComparison", () => {
  it("marks growth as positive when up is good", () => {
    const delta = buildDeltaFromComparison(112, 100, "up-is-good");
    expect(delta).toEqual({ percentText: "12%", direction: "up", sentiment: "positive" });
  });

  it("marks growth as negative when down is good", () => {
    const delta = buildDeltaFromComparison(112, 100, "down-is-good");
    expect(delta?.sentiment).toBe("negative");
  });

  it("marks declines with flipped sentiment when down is good", () => {
    const delta = buildDeltaFromComparison(88, 100, "down-is-good");
    expect(delta).toEqual({ percentText: "12%", direction: "down", sentiment: "positive" });
  });

  it("returns a neutral flat delta for tiny movement", () => {
    const delta = buildDeltaFromComparison(100.2, 100, "up-is-good");
    expect(delta?.direction).toBe("flat");
    expect(delta?.sentiment).toBe("neutral");
  });

  it("omits the delta when there is no previous period", () => {
    expect(buildDeltaFromComparison(100, 0, "up-is-good")).toBeNull();
  });
});

describe("buildKpiTileModels", () => {
  it("builds six tiles with formatted values and sentiment-aware deltas", () => {
    const current = totalsWith({ callsAnswered: 1184, appointmentsNoShows: 20 });
    const previous = totalsWith({ callsAnswered: 1000, appointmentsNoShows: 25 });
    const tiles = buildKpiTileModels(current, previous, []);
    expect(tiles).toHaveLength(6);

    const answeredTile = tiles.find((tile) => tile.key === "calls-answered");
    expect(answeredTile?.value).toBe("1,184");
    expect(answeredTile?.delta?.sentiment).toBe("positive");

    const noShowTile = tiles.find((tile) => tile.key === "no-show-rate");
    expect(noShowTile?.delta?.sentiment).toBe("positive");
    expect(noShowTile?.value).toBe("5%");
  });

  it("threads daily series into sparkline values by date order", () => {
    const dailyRows = [
      { date: "2026-08-02", calls: { answered: 5 } },
      { date: "2026-08-01", calls: { answered: 3 } },
      { date: "2026-08-01", calls: { answered: 4 } },
    ];
    const tiles = buildKpiTileModels(totalsWith({}), totalsWith({}), dailyRows as never[]);
    const answeredTile = tiles.find((tile) => tile.key === "calls-answered");
    expect(answeredTile?.sparklineValues).toEqual([7, 5]);
  });
});

describe("buildTrendChartModel", () => {
  const rows = [
    {
      date: "2026-08-01",
      calls: { answered: 10, missed: 2 },
      appointments: { completed: 5, noShows: 1 },
      revenue: { collectedCents: 1000 },
    },
    {
      date: "2026-08-02",
      calls: { answered: 12, missed: 3 },
      appointments: { completed: 6, noShows: 2 },
      revenue: { collectedCents: 2000 },
    },
    {
      date: "2026-08-01",
      calls: { answered: 4, missed: 1 },
      appointments: { completed: 2, noShows: 0 },
      revenue: { collectedCents: 500 },
    },
  ] as never[];

  it("builds two call series summed per date", () => {
    const model = buildTrendChartModel(rows, "calls");
    expect(model.series.map((entry) => entry.label)).toEqual(["Answered", "Missed"]);
    expect(model.series[0]?.points).toEqual([
      { date: "2026-08-01", value: 14 },
      { date: "2026-08-02", value: 12 },
    ]);
    expect(model.series[1]?.points).toEqual([
      { date: "2026-08-01", value: 3 },
      { date: "2026-08-02", value: 3 },
    ]);
  });

  it("builds a single revenue series in dollars", () => {
    const model = buildTrendChartModel(rows, "revenue");
    expect(model.series).toHaveLength(1);
    expect(model.series[0]?.points).toEqual([
      { date: "2026-08-01", value: 15 },
      { date: "2026-08-02", value: 20 },
    ]);
  });
});
