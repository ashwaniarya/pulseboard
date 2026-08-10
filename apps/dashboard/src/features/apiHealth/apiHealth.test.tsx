import { http, HttpResponse } from "msw";
import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { apiHealthReducer, apiRequestFailed, apiRequestSucceeded } from "./apiHealthSlice";
import { mockApiServer } from "../../test/mockApiServer";
import { renderDashboardAt } from "../../test/renderWithProviders";

describe("apiHealthSlice", () => {
  it("flips to degraded after two failures inside the window", () => {
    let state = apiHealthReducer(undefined, apiRequestFailed({ atMs: 1000 }));
    expect(state.status).toBe("healthy");
    state = apiHealthReducer(state, apiRequestFailed({ atMs: 2000 }));
    expect(state.status).toBe("degraded");
    state = apiHealthReducer(state, apiRequestSucceeded());
    expect(state.status).toBe("healthy");
  });

  it("ignores failures that fell out of the thirty-second window", () => {
    let state = apiHealthReducer(undefined, apiRequestFailed({ atMs: 1000 }));
    state = apiHealthReducer(state, apiRequestFailed({ atMs: 40_000 }));
    expect(state.status).toBe("healthy");
  });
});

describe("ApiStatusBanner", () => {
  it("appears when the api degrades and clears on retry", async () => {
    mockApiServer.use(
      http.get("*/api/v1/metrics/summary", () =>
        HttpResponse.json({ title: "down" }, { status: 503 }),
      ),
      http.get("*/api/v1/metrics/daily", () =>
        HttpResponse.json({ title: "down" }, { status: 503 }),
      ),
    );
    const user = (await import("@testing-library/user-event")).default.setup();
    renderDashboardAt("/?range=last7");
    expect(
      await screen.findByText(/Live data is having trouble/, undefined, { timeout: 10000 }),
    ).toBeInTheDocument();
    mockApiServer.resetHandlers();
    await user.click(screen.getByRole("button", { name: "Retry all" }));
    await waitFor(
      () => {
        expect(screen.queryByText(/Live data is having trouble/)).not.toBeInTheDocument();
      },
      { timeout: 10000 },
    );
  }, 25000);
});
