const PINNED = "datasetEndDate=2026-08-10";

const EXPECTED_ANSWERED_LAST30 = "13,324";

describe("application boot", () => {
  it("serves the shell with live seeded metrics", () => {
    cy.visit(`/?${PINNED}&range=last30`);
    cy.contains("Pulseboard");
    cy.get('nav[aria-label="Primary"]').within(() => {
      cy.contains("Overview");
      cy.contains("Calls");
      cy.contains("Locations");
      cy.contains("Benchmark");
    });
    cy.contains("Calls answered");
    cy.contains(EXPECTED_ANSWERED_LAST30, { timeout: 10000 });
    cy.contains("Missed calls");
    cy.contains("No-show rate");
    cy.contains("Revenue collected");
    cy.contains("Daily trend");
    cy.contains("Answer-rate leaderboard");
  });
});
