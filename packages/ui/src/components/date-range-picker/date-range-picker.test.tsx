import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DateRangePicker, formatDateRangeLabel } from "./date-range-picker";

const LAST_SEVEN_DAYS = { startDate: "2026-08-04", endDate: "2026-08-10" };
const PRESETS = [
  { id: "last7", label: "Last 7 days", range: LAST_SEVEN_DAYS },
  {
    id: "last30",
    label: "Last 30 days",
    range: { startDate: "2026-07-12", endDate: "2026-08-10" },
  },
];

describe("formatDateRangeLabel", () => {
  it("formats a cross-month range with the year once", () => {
    expect(formatDateRangeLabel({ startDate: "2026-07-12", endDate: "2026-08-10" })).toBe(
      "Jul 12 – Aug 10, 2026",
    );
  });
});

describe("DateRangePicker", () => {
  it("shows the preset label when a preset is active", () => {
    render(
      <DateRangePicker
        value={LAST_SEVEN_DAYS}
        presets={PRESETS}
        activePresetId="last7"
        onRangeChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Date range: Last 7 days" })).toBeInTheDocument();
  });

  it("emits the preset range and id when a preset is chosen", async () => {
    const user = userEvent.setup();
    const handleRangeChange = vi.fn();
    render(
      <DateRangePicker
        value={LAST_SEVEN_DAYS}
        presets={PRESETS}
        activePresetId="last7"
        onRangeChange={handleRangeChange}
      />,
    );
    await user.click(screen.getByRole("button", { name: /Date range/ }));
    await user.click(await screen.findByRole("button", { name: "Last 30 days" }));
    expect(handleRangeChange).toHaveBeenCalledWith(
      { startDate: "2026-07-12", endDate: "2026-08-10" },
      "last30",
    );
  });

  it("emits a custom range with a null preset after two calendar clicks", async () => {
    const user = userEvent.setup();
    const handleRangeChange = vi.fn();
    render(
      <DateRangePicker
        value={LAST_SEVEN_DAYS}
        presets={PRESETS}
        onRangeChange={handleRangeChange}
        defaultCalendarMonth={new Date(2026, 6)}
      />,
    );
    await user.click(screen.getByRole("button", { name: /Date range/ }));
    const dayTen = await screen.findByRole("button", { name: /July 10/ });
    await user.click(dayTen);
    await user.click(screen.getByRole("button", { name: /July 15/ }));
    expect(handleRangeChange).toHaveBeenCalledWith(
      { startDate: "2026-07-10", endDate: "2026-07-15" },
      null,
    );
  });
});
