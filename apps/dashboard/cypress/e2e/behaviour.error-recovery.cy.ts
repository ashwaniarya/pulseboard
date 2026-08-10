const PINNED = "datasetEndDate=2026-08-10";

describe("error architecture", () => {
  it("degrades gracefully during an outage and recovers", () => {
    cy.visit(`/?${PINNED}&range=last30&apiScenario=outage`);
    cy.contains("Couldn't load this data", { timeout: 20000 });
    cy.contains("Live data is having trouble", { timeout: 20000 });

    cy.contains("button", "Demo").click();
    cy.contains("button", "Healthy").click();
    cy.get("body").type("{esc}");
    cy.contains("Calls answered", { timeout: 20000 });
    cy.contains("13,324", { timeout: 20000 });
    cy.contains("Live data is having trouble", { timeout: 20000 }).should("not.exist");
  });
});
