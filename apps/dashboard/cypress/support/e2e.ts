beforeEach(() => {
  cy.window().then((win) => {
    win.localStorage.clear();
  });
});

export const PINNED_DATASET_QUERY = "datasetEndDate=2026-08-10";
