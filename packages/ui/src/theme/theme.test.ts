import { describe, expect, it } from "vitest";

import { THEME_BOOTSTRAP_SCRIPT, THEME_STORAGE_KEY, resolveInitialTheme } from "./theme-script";

describe("resolveInitialTheme", () => {
  it("prefers a stored explicit theme", () => {
    expect(resolveInitialTheme("dark", false)).toBe("dark");
    expect(resolveInitialTheme("light", true)).toBe("light");
  });

  it("falls back to the system preference", () => {
    expect(resolveInitialTheme(null, true)).toBe("dark");
    expect(resolveInitialTheme(null, false)).toBe("light");
  });

  it("ignores unknown stored values", () => {
    expect(resolveInitialTheme("neon", true)).toBe("dark");
  });
});

describe("THEME_BOOTSTRAP_SCRIPT", () => {
  it("reads the shared storage key and stamps data-theme", () => {
    expect(THEME_BOOTSTRAP_SCRIPT).toContain(THEME_STORAGE_KEY);
    expect(THEME_BOOTSTRAP_SCRIPT).toContain("data-theme");
    expect(THEME_BOOTSTRAP_SCRIPT).toContain("prefers-color-scheme: dark");
  });
});
