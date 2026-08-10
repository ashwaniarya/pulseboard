import { describe, expect, it } from "vitest";

import { initializeSentryIfConfigured } from "./sentry";

describe("initializeSentryIfConfigured", () => {
  it("skips initialisation without a DSN", () => {
    expect(initializeSentryIfConfigured(undefined)).toBe(false);
    expect(initializeSentryIfConfigured("")).toBe(false);
  });
});
