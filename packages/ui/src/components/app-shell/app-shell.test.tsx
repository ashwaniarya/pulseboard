import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { AppShell, Sidebar, SidebarNavItem } from "./app-shell";

function renderShell() {
  return render(
    <AppShell
      sidebar={
        <Sidebar>
          <SidebarNavItem label="Overview" isActive />
          <SidebarNavItem label="Calls" />
        </Sidebar>
      }
      topbar={<span>toolbar</span>}
    >
      <p>page body</p>
    </AppShell>,
  );
}

describe("AppShell", () => {
  it("provides skip link, landmarks and current-page marking", () => {
    renderShell();
    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveAttribute(
      "href",
      "#main-content",
    );
    expect(screen.getByRole("main")).toHaveTextContent("page body");
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute("aria-current", "page");
  });

  it("opens and closes the mobile navigation drawer", async () => {
    const user = userEvent.setup();
    renderShell();
    await user.click(screen.getByRole("button", { name: "Open navigation" }));
    const drawer = await screen.findByRole("dialog", { name: "Navigation" });
    expect(drawer).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes the drawer when a navigation link is chosen", async () => {
    const user = userEvent.setup();
    renderShell();
    await user.click(screen.getByRole("button", { name: "Open navigation" }));
    const drawer = await screen.findByRole("dialog", { name: "Navigation" });
    const drawerLinks = screen.getAllByRole("link", { name: "Calls" });
    const linkInsideDrawer = drawerLinks.find((link) => drawer.contains(link));
    if (linkInsideDrawer === undefined) {
      throw new Error("expected the drawer to repeat the navigation");
    }
    await user.click(linkInsideDrawer);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
