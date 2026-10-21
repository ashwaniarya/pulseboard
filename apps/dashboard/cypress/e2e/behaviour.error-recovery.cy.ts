import { PINNED_LAST_30_DAYS_QUERY } from "../support/pinnedDataset";

describe("error architecture", () => {
  it("degrades gracefully during an outage and recovers", () => {
    cy.visit(`/?${PINNED_LAST_30_DAYS_QUERY}&apiScenario=outage`);
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
