const PINNED = "datasetEndDate=2026-08-10";

describe("theme and mobile shell", () => {
  it("persists the dark theme across reloads", () => {
    cy.visit(`/?${PINNED}&range=last30`);
    cy.contains("Calls answered", { timeout: 10000 });
    cy.get("html").then(($html) => {
      const initialTheme = $html.attr("data-theme");
      const toggleName = initialTheme === "dark" ? "Switch to light theme" : "Switch to dark theme";
      const expectedTheme = initialTheme === "dark" ? "light" : "dark";
      cy.get(`button[aria-label="${toggleName}"]`).click();
      cy.get("html").should("have.attr", "data-theme", expectedTheme);
      cy.reload();
      cy.get("html").should("have.attr", "data-theme", expectedTheme);
    });
  });

  it("opens the navigation drawer on a phone viewport in dark mode", () => {
    cy.viewport("iphone-x");
    cy.visit(`/?${PINNED}&range=last30`);
    cy.contains("Calls answered", { timeout: 10000 });
    cy.get('button[aria-label="Switch to dark theme"], button[aria-label="Switch to light theme"]');
    cy.get('button[aria-label="Open navigation"]').click();
    cy.get('[role="dialog"][aria-label], [role="dialog"]').within(() => {
      cy.contains("Calls").click();
    });
    cy.url().should("include", "/calls");
  });
});
