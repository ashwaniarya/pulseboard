import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "./App";

describe("App", () => {
  it("shows the brand while the dashboard boots", () => {
    render(<App />);
    expect(screen.getByText("Pulseboard")).toBeInTheDocument();
  });
});
