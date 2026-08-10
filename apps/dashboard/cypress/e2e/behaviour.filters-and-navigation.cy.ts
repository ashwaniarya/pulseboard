const PINNED = "datasetEndDate=2026-08-10";

const EXPECTED_ANSWERED_LAST30 = "13,324";

describe("filters and deep links", () => {
  it("changes the range preset and reflects it in the url", () => {
    cy.visit(`/?${PINNED}&range=last30`);
    cy.contains(EXPECTED_ANSWERED_LAST30, { timeout: 10000 });
    cy.get('button[aria-label="Date range: Last 30 days"]').click();
    cy.contains("button", "Last 7 days").click();
    cy.url().should("include", "range=last7");
    cy.get('button[aria-label="Date range: Last 7 days"]');
    cy.contains(EXPECTED_ANSWERED_LAST30).should("not.exist");
  });

  it("narrows to one location through the multi-select", () => {
    cy.visit(`/?${PINNED}&range=last30`);
    cy.contains(EXPECTED_ANSWERED_LAST30, { timeout: 10000 });
    cy.get('button[aria-label="Locations: All locations"]').click();
    cy.get('[role="option"]').contains("Lakeview Smiles").click();
    cy.get("body").type("{esc}");
    cy.url().should("include", "locations=loc-lakeview");
    cy.get('button[aria-label="Locations: 1 of 12 selected"]');
    cy.contains(EXPECTED_ANSWERED_LAST30).should("not.exist");
  });

  it("restores full state from a deep link after reload", () => {
    cy.visit(`/calls?${PINNED}&range=last7&statuses=missed&sortBy=waitSeconds&sortDirection=desc`);
    cy.contains(/calls loaded/, { timeout: 10000 });
    cy.get('th[aria-sort="descending"]').contains("Wait");
    cy.reload();
    cy.contains(/calls loaded/, { timeout: 10000 });
    cy.get('th[aria-sort="descending"]').contains("Wait");
    cy.url().should("include", "statuses=missed");
  });
});
