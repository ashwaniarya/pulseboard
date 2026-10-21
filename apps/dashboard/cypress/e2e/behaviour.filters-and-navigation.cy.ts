import { PINNED_LAST_30_DAYS_QUERY, PINNED_LAST_7_DAYS_QUERY } from "../support/pinnedDataset";

const EXPECTED_ANSWERED_LAST30 = "13,324";

describe("filters and deep links", () => {
  it("changes the range preset and reflects it in the url", () => {
    cy.visit(`/?${PINNED_LAST_30_DAYS_QUERY}`);
    cy.contains(EXPECTED_ANSWERED_LAST30, { timeout: 10000 });
    cy.get('button[aria-label^="Date range:"]').click();
    cy.contains("button", "Last 7 days").click();
    cy.url().should("include", "range=last7");
    cy.get('button[aria-label="Date range: Last 7 days"]');
  });

  it("narrows to one location through the multi-select", () => {
    cy.visit(`/?${PINNED_LAST_30_DAYS_QUERY}`);
    cy.contains(EXPECTED_ANSWERED_LAST30, { timeout: 10000 });
    cy.get('button[aria-label="Locations: All locations"]').click();
    cy.get('[role="option"]').contains("Lakeview Smiles").click();
    cy.get("body").type("{esc}");
    cy.url().should("include", "locations=loc-lakeview");
    cy.get('button[aria-label="Locations: 1 of 12 selected"]');
    cy.contains(EXPECTED_ANSWERED_LAST30).should("not.exist");
  });

  it("restores full state from a deep link after reload", () => {
    cy.visit(
      `/calls?${PINNED_LAST_7_DAYS_QUERY}&statuses=missed&sortBy=waitSeconds&sortDirection=desc`,
    );
    cy.contains(/calls loaded/, { timeout: 10000 });
    cy.get('th[aria-sort="descending"]').contains("Wait");
    cy.reload();
    cy.contains(/calls loaded/, { timeout: 10000 });
    cy.get('th[aria-sort="descending"]').contains("Wait");
    cy.url().should("include", "statuses=missed");
  });
});
