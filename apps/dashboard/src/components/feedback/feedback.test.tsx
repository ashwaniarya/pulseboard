import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { QueryStateGate } from "./QueryStateGate";
import { WidgetErrorBoundary } from "./WidgetErrorBoundary";

interface FakeQueryState {
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  data?: string[];
}

function gateWith(query: FakeQueryState, refetch = vi.fn()) {
  return (
    <QueryStateGate
      query={{ ...query, refetch }}
      skeleton={<p>skeleton</p>}
      emptyWhen={(data) => data.length === 0}
      empty={<p>nothing here</p>}
    >
      {(data) => <p>loaded {data.join(",")}</p>}
    </QueryStateGate>
  );
}

describe("QueryStateGate", () => {
  it("shows the skeleton on first load", () => {
    render(gateWith({ isLoading: true, isFetching: true, isError: false }));
    expect(screen.getByText("skeleton")).toBeInTheDocument();
  });

  it("renders an inline error with a working retry", async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    render(gateWith({ isLoading: false, isFetching: false, isError: true }, refetch));
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("renders the designed empty state", () => {
    render(gateWith({ isLoading: false, isFetching: false, isError: false, data: [] }));
    expect(screen.getByText("nothing here")).toBeInTheDocument();
  });

  it("renders data when ready", () => {
    render(gateWith({ isLoading: false, isFetching: false, isError: false, data: ["a", "b"] }));
    expect(screen.getByText("loaded a,b")).toBeInTheDocument();
  });

  it("keeps stale data visible with a busy marker during refetch", () => {
    render(gateWith({ isLoading: false, isFetching: true, isError: false, data: ["a"] }));
    expect(screen.getByText("loaded a")).toBeInTheDocument();
    expect(screen.getByTestId("query-refreshing-overlay")).toBeInTheDocument();
  });

  it("prefers stale data over the error panel when a background refetch fails", () => {
    render(gateWith({ isLoading: false, isFetching: false, isError: true, data: ["a"] }));
    expect(screen.getByText("loaded a")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Try again" })).not.toBeInTheDocument();
  });
});

function ExplodingWidget({ shouldExplode }: { shouldExplode: boolean }) {
  if (shouldExplode) {
    throw new Error("render exploded");
  }
  return <p>widget content</p>;
}

function BoundaryHarness() {
  const [shouldExplode, setShouldExplode] = useState(true);
  return (
    <WidgetErrorBoundary
      onReset={() => {
        setShouldExplode(false);
      }}
    >
      <ExplodingWidget shouldExplode={shouldExplode} />
    </WidgetErrorBoundary>
  );
}

describe("WidgetErrorBoundary", () => {
  it("catches render errors and recovers through Try again", async () => {
    const user = userEvent.setup();
    render(<BoundaryHarness />);
    expect(screen.getByText("This widget crashed")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("widget content")).toBeInTheDocument();
  });
});
