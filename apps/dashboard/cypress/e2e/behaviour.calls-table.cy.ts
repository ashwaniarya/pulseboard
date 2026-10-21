import { PINNED_LAST_7_DAYS_QUERY } from "../support/pinnedDataset";

describe("calls table", () => {
  it("sorts by wait server-side and grows through infinite scroll", () => {
    cy.visit(`/calls?${PINNED_LAST_7_DAYS_QUERY}`);
    cy.contains("100 of", { timeout: 10000 });
    cy.contains("button", "Wait").click();
    cy.get('th[aria-sort="descending"]').contains("Wait");
    cy.get("tbody tr[data-index]").first().should("contain.text", "m ");
    cy.get("tbody tr[data-index]").should("have.length.greaterThan", 5);
    cy.get(".max-h-\\[560px\\]").scrollTo("bottom");
    cy.contains("200 of", { timeout: 10000 });
  });

  it("shows the designed empty state for a no-match search", () => {
    cy.visit(`/calls?${PINNED_LAST_7_DAYS_QUERY}&search=zzzznobody`);
    cy.contains("No calls match these filters", { timeout: 10000 });
    cy.contains("button", "Clear filters").click();
    cy.contains(/of [\d,]+ calls loaded/, { timeout: 10000 });
  });
});
