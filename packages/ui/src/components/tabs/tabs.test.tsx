import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Tab, TabList, TabPanel, Tabs } from "./tabs";

function renderMetricTabs() {
  return render(
    <Tabs defaultValue="calls">
      <TabList label="Metric family">
        <Tab value="calls">Calls</Tab>
        <Tab value="appointments">Appointments</Tab>
        <Tab value="reviews">Reviews</Tab>
      </TabList>
      <TabPanel value="calls">Calls content</TabPanel>
      <TabPanel value="appointments">Appointments content</TabPanel>
      <TabPanel value="reviews">Reviews content</TabPanel>
    </Tabs>,
  );
}

describe("Tabs", () => {
  it("wires tablist, selection state and panel labelling", () => {
    renderMetricTabs();
    expect(screen.getByRole("tablist", { name: "Metric family" })).toBeInTheDocument();
    const activeTab = screen.getByRole("tab", { name: "Calls" });
    expect(activeTab).toHaveAttribute("aria-selected", "true");
    const activePanel = screen.getByRole("tabpanel", { name: "Calls" });
    expect(activePanel).toHaveTextContent("Calls content");
    expect(screen.getByText("Appointments content")).not.toBeVisible();
  });

  it("selects a tab on click and shows its panel", async () => {
    const user = userEvent.setup();
    renderMetricTabs();
    await user.click(screen.getByRole("tab", { name: "Reviews" }));
    expect(screen.getByRole("tab", { name: "Reviews" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: "Reviews" })).toBeVisible();
  });

  it("keeps only the active tab in the tab order", () => {
    renderMetricTabs();
    expect(screen.getByRole("tab", { name: "Calls" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("tab", { name: "Appointments" })).toHaveAttribute("tabindex", "-1");
  });
});
