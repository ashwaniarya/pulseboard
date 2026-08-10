import { describe, expect, it } from "vitest";

import { classNames } from "./class-names";

describe("classNames", () => {
  it("joins conditional class values", () => {
    expect(classNames("card", false, undefined, "raised")).toBe("card raised");
  });

  it("lets the last conflicting tailwind utility win", () => {
    expect(classNames("p-2 text-text-muted", "p-4")).toBe("text-text-muted p-4");
  });
});
