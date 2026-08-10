import { describe, expect, it } from "vitest";

import { buildSparklinePath } from "./sparkline";

describe("buildSparklinePath", () => {
  it("returns an empty path for fewer than two points", () => {
    expect(buildSparklinePath([])).toBe("");
    expect(buildSparklinePath([5])).toBe("");
  });

  it("spans the full width and maps extremes to the padded edges", () => {
    const path = buildSparklinePath([0, 10], 100, 40);
    expect(path).toBe("M0.00,38.00 L100.00,2.00");
  });

  it("draws a flat series along the vertical midline", () => {
    const path = buildSparklinePath([7, 7, 7], 100, 40);
    expect(path).toBe("M0.00,20.00 L50.00,20.00 L100.00,20.00");
  });
});
