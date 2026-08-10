import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ChartCard } from "./chart-card";

describe("ChartCard", () => {
  it("shows children only when ready", () => {
    render(
      <ChartCard title="Call volume" status="ready">
        <p>chart body</p>
      </ChartCard>,
    );
    expect(screen.getByRole("heading", { name: "Call volume" })).toBeInTheDocument();
    expect(screen.getByText("chart body")).toBeInTheDocument();
  });

  it("announces loading and hides the body", () => {
    const { container } = render(
      <ChartCard title="Call volume" status="loading">
        <p>chart body</p>
      </ChartCard>,
    );
    expect(container.firstElementChild).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByText("chart body")).not.toBeInTheDocument();
  });

  it("renders a default empty state with guidance", () => {
    render(<ChartCard title="Call volume" status="empty" />);
    expect(screen.getByText("No data in this range")).toBeInTheDocument();
  });

  it("wires the retry callback in the error state", async () => {
    const user = userEvent.setup();
    const handleRetry = vi.fn();
    render(<ChartCard title="Call volume" status="error" onRetry={handleRetry} />);
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});
