import { describe, expect, it } from "vitest";

import { resolveDateRangePreset } from "../../lib/dateRange";
import {
  createInitialFiltersState,
  dateRangeChanged,
  filtersHydratedFromUrl,
  filtersReducer,
  locationSelectionChanged,
} from "./filtersSlice";
import { selectMetricsQueryArgs } from "./selectMetricsQueryArgs";
import { parseFiltersFromUrl, serializeFiltersToUrl } from "./urlSync";

const TODAY = "2026-08-10";

describe("resolveDateRangePreset", () => {
  it("resolves inclusive bounds for the built-in presets", () => {
    expect(resolveDateRangePreset("last7", TODAY)).toEqual({
      startDate: "2026-08-04",
      endDate: "2026-08-10",
    });
    expect(resolveDateRangePreset("last30", TODAY)).toEqual({
      startDate: "2026-07-12",
      endDate: "2026-08-10",
    });
    expect(resolveDateRangePreset("last90", TODAY)).toEqual({
      startDate: "2026-05-13",
      endDate: "2026-08-10",
    });
  });
});

describe("filtersSlice", () => {
  it("starts on the last 30 days with every location", () => {
    const initialState = createInitialFiltersState(TODAY);
    expect(initialState.dateRange.presetId).toBe("last30");
    expect(initialState.dateRange.startDate).toBe("2026-07-12");
    expect(initialState.selectedLocationIds).toEqual([]);
  });

  it("stores concrete dates when a preset is applied", () => {
    const state = filtersReducer(
      createInitialFiltersState(TODAY),
      dateRangeChanged({
        range: resolveDateRangePreset("last7", TODAY),
        presetId: "last7",
      }),
    );
    expect(state.dateRange).toEqual({
      presetId: "last7",
      startDate: "2026-08-04",
      endDate: "2026-08-10",
    });
  });

  it("replaces the location selection", () => {
    const state = filtersReducer(
      createInitialFiltersState(TODAY),
      locationSelectionChanged(["loc-lakeview", "loc-cedar-park"]),
    );
    expect(state.selectedLocationIds).toEqual(["loc-lakeview", "loc-cedar-park"]);
  });

  it("adopts a hydrated snapshot wholesale", () => {
    const snapshot = parseFiltersFromUrl("?range=last7&locations=loc-palm-court", TODAY);
    const state = filtersReducer(
      createInitialFiltersState(TODAY),
      filtersHydratedFromUrl(snapshot),
    );
    expect(state.dateRange.presetId).toBe("last7");
    expect(state.selectedLocationIds).toEqual(["loc-palm-court"]);
  });
});

describe("urlSync", () => {
  it("round-trips presets and locations", () => {
    const original = createInitialFiltersState(TODAY);
    const withSelection = filtersReducer(
      original,
      locationSelectionChanged(["loc-lakeview", "loc-cedar-park"]),
    );
    const query = serializeFiltersToUrl(withSelection);
    expect(query).toBe("range=last30&locations=loc-lakeview%2Cloc-cedar-park");
    const parsed = parseFiltersFromUrl(`?${query}`, TODAY);
    expect(parsed).toEqual(withSelection);
  });

  it("serialises custom ranges as explicit dates", () => {
    const custom = filtersReducer(
      createInitialFiltersState(TODAY),
      dateRangeChanged({
        range: { startDate: "2026-06-01", endDate: "2026-06-15" },
        presetId: null,
      }),
    );
    const query = serializeFiltersToUrl(custom);
    expect(query).toBe("startDate=2026-06-01&endDate=2026-06-15");
    expect(parseFiltersFromUrl(`?${query}`, TODAY).dateRange).toEqual(custom.dateRange);
  });

  it("falls back to defaults for malformed input", () => {
    const parsed = parseFiltersFromUrl("?range=lastCentury&locations=", TODAY);
    expect(parsed).toEqual(createInitialFiltersState(TODAY));
    const badDates = parseFiltersFromUrl("?startDate=nope&endDate=2026-06-15", TODAY);
    expect(badDates.dateRange.presetId).toBe("last30");
  });
});

describe("selectMetricsQueryArgs", () => {
  it("returns a referentially stable object for unchanged inputs", () => {
    const state = { filters: createInitialFiltersState(TODAY) };
    const firstResult = selectMetricsQueryArgs(state);
    const secondResult = selectMetricsQueryArgs(state);
    expect(secondResult).toBe(firstResult);
  });

  it("produces a new reference when the range changes", () => {
    const state = { filters: createInitialFiltersState(TODAY) };
    const firstResult = selectMetricsQueryArgs(state);
    const changed = {
      filters: filtersReducer(
        state.filters,
        dateRangeChanged({ range: resolveDateRangePreset("last7", TODAY), presetId: "last7" }),
      ),
    };
    const secondResult = selectMetricsQueryArgs(changed);
    expect(secondResult).not.toBe(firstResult);
    expect(secondResult.startDate).toBe("2026-08-04");
  });
});
