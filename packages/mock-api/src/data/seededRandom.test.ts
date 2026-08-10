import { describe, expect, it } from "vitest";

import {
  createSeededRandom,
  createStreamRandom,
  hashStringToSeed,
  pickOne,
  pickWeighted,
  randomFloatBetween,
  randomGaussian,
  randomIntegerBetween,
} from "./seededRandom";

function collectValues(random: () => number, count: number): number[] {
  return Array.from({ length: count }, () => random());
}

describe("createSeededRandom", () => {
  it("produces an identical sequence for the same seed", () => {
    const firstRun = collectValues(createSeededRandom(42), 1000);
    const secondRun = collectValues(createSeededRandom(42), 1000);
    expect(firstRun).toEqual(secondRun);
  });

  it("produces different sequences for different seeds", () => {
    const seedA = collectValues(createSeededRandom(1), 50);
    const seedB = collectValues(createSeededRandom(2), 50);
    expect(seedA).not.toEqual(seedB);
  });

  it("only emits values in the [0, 1) range", () => {
    const values = collectValues(createSeededRandom(7), 1000);
    for (const value of values) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe("hashStringToSeed", () => {
  it("is deterministic for the same input", () => {
    expect(hashStringToSeed("pulseboard-v1:loc-1:calls")).toBe(
      hashStringToSeed("pulseboard-v1:loc-1:calls"),
    );
  });

  it("maps different inputs to different seeds", () => {
    const seeds = new Set(
      ["calls", "appointments", "messages", "reviews", "revenue"].map(hashStringToSeed),
    );
    expect(seeds.size).toBe(5);
  });
});

describe("createStreamRandom", () => {
  it("keeps streams with different keys independent", () => {
    const callsStream = collectValues(createStreamRandom("loc-1:calls"), 50);
    const reviewsStream = collectValues(createStreamRandom("loc-1:reviews"), 50);
    expect(callsStream).not.toEqual(reviewsStream);
  });

  it("replays the same stream for the same key", () => {
    expect(collectValues(createStreamRandom("loc-1:calls"), 50)).toEqual(
      collectValues(createStreamRandom("loc-1:calls"), 50),
    );
  });
});

describe("randomIntegerBetween", () => {
  it("stays inside inclusive bounds and reaches both endpoints", () => {
    const random = createSeededRandom(11);
    const drawn = Array.from({ length: 2000 }, () => randomIntegerBetween(random, 3, 6));
    expect(Math.min(...drawn)).toBe(3);
    expect(Math.max(...drawn)).toBe(6);
    for (const value of drawn) {
      expect(Number.isInteger(value)).toBe(true);
    }
  });
});

describe("randomFloatBetween", () => {
  it("stays inside the requested range", () => {
    const random = createSeededRandom(13);
    for (let draw = 0; draw < 500; draw += 1) {
      const value = randomFloatBetween(random, 0.5, 2.5);
      expect(value).toBeGreaterThanOrEqual(0.5);
      expect(value).toBeLessThan(2.5);
    }
  });
});

describe("randomGaussian", () => {
  it("approximates the requested mean and spread", () => {
    const random = createSeededRandom(17);
    const samples = Array.from({ length: 10000 }, () => randomGaussian(random, 100, 15));
    const sampleMean = samples.reduce((sum, value) => sum + value, 0) / samples.length;
    const sampleVariance =
      samples.reduce((sum, value) => sum + (value - sampleMean) ** 2, 0) / samples.length;
    expect(sampleMean).toBeGreaterThan(98);
    expect(sampleMean).toBeLessThan(102);
    expect(Math.sqrt(sampleVariance)).toBeGreaterThan(13.5);
    expect(Math.sqrt(sampleVariance)).toBeLessThan(16.5);
  });
});

describe("pickOne", () => {
  it("only returns members of the list", () => {
    const random = createSeededRandom(19);
    const options = ["monday", "tuesday", "wednesday"];
    for (let draw = 0; draw < 200; draw += 1) {
      expect(options).toContain(pickOne(random, options));
    }
  });

  it("rejects an empty list", () => {
    expect(() => pickOne(createSeededRandom(1), [])).toThrow();
  });
});

describe("pickWeighted", () => {
  it("never selects zero-weight entries", () => {
    const random = createSeededRandom(23);
    const entries = [
      { value: "kept", weight: 1 },
      { value: "excluded", weight: 0 },
    ];
    for (let draw = 0; draw < 300; draw += 1) {
      expect(pickWeighted(random, entries)).toBe("kept");
    }
  });

  it("selects entries roughly in proportion to their weights", () => {
    const random = createSeededRandom(29);
    const entries = [
      { value: "common", weight: 9 },
      { value: "rare", weight: 1 },
    ];
    let commonCount = 0;
    for (let draw = 0; draw < 5000; draw += 1) {
      if (pickWeighted(random, entries) === "common") {
        commonCount += 1;
      }
    }
    expect(commonCount / 5000).toBeGreaterThan(0.85);
    expect(commonCount / 5000).toBeLessThan(0.95);
  });

  it("rejects entries without any positive weight", () => {
    expect(() => pickWeighted(createSeededRandom(1), [{ value: "never", weight: 0 }])).toThrow();
  });
});
