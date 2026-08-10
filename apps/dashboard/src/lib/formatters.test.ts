import { describe, expect, it } from "vitest";

import {
  formatCount,
  formatCurrencyFromCents,
  formatPercentValue,
  formatRating,
  formatSeconds,
} from "./formatters";

describe("formatters", () => {
  it("formats counts with thousands separators", () => {
    expect(formatCount(1184)).toBe("1,184");
    expect(formatCount(0)).toBe("0");
  });

  it("formats whole-dollar currency from integer cents", () => {
    expect(formatCurrencyFromCents(8421050)).toBe("$84,211");
    expect(formatCurrencyFromCents(0)).toBe("$0");
  });

  it("formats percentages to one decimal", () => {
    expect(formatPercentValue(6.25)).toBe("6.3%");
    expect(formatPercentValue(100)).toBe("100%");
  });

  it("formats seconds compactly", () => {
    expect(formatSeconds(22.4)).toBe("22s");
    expect(formatSeconds(95)).toBe("1m 35s");
  });

  it("formats ratings on the five-point scale and dashes when absent", () => {
    expect(formatRating(4.62)).toBe("4.6 / 5");
    expect(formatRating(null)).toBe("—");
  });
});
