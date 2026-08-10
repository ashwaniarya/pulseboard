import { getActiveDataset } from "@pulseboard/mock-api/data";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { formatCount } from "../../lib/formatters";
import { renderDashboardAt } from "../../test/renderWithProviders";

function recordsInLastSevenDays() {
  return getActiveDataset().callRecords.filter(
    (record) => record.startedAt.slice(0, 10) >= "2026-08-04",
  );
}

describe("CallsPage", () => {
  it("loads the first page and reports the seeded total", async () => {
    renderDashboardAt("/calls?range=last7");
    const expectedTotal = recordsInLastSevenDays().length;
    await waitFor(
      () => {
        expect(
          screen.getByText(`100 of ${formatCount(expectedTotal)} calls loaded`),
        ).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });

  it("drives server-side sorting from the wait header", async () => {
    const user = userEvent.setup();
    renderDashboardAt("/calls?range=last7");
    const waitHeaderButton = await screen.findByRole("button", { name: /Wait/ }, { timeout: 5000 });
    await user.click(waitHeaderButton);
    await waitFor(
      () => {
        expect(screen.getByRole("columnheader", { name: /Wait/ })).toHaveAttribute(
          "aria-sort",
          "descending",
        );
      },
      { timeout: 5000 },
    );
    await user.click(screen.getByRole("button", { name: /Wait/ }));
    await waitFor(() => {
      expect(screen.getByRole("columnheader", { name: /Wait/ })).toHaveAttribute(
        "aria-sort",
        "ascending",
      );
    });
  });

  it("shows the designed empty state for a no-match search and recovers on clear", async () => {
    const user = userEvent.setup();
    renderDashboardAt("/calls?range=last7&search=zzzznobody");
    expect(
      await screen.findByText("No calls match these filters", undefined, { timeout: 5000 }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    await waitFor(
      () => {
        expect(screen.queryByText("No calls match these filters")).not.toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });
});
