import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("is hidden from assistive technology", () => {
    const { container } = render(<Skeleton shape="text" />);
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });
});
