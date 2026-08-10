# Performance

Measured numbers, how they were captured, and the policies that keep them honest.

## Virtualized table — 52,555 rows

Captured on the production build (`vite preview`) in headless Chrome via a scripted
Cypress run against `/benchmark/table` (the page ships in the app — run it yourself).

| Measurement                                  | Value   | Notes                                                          |
| -------------------------------------------- | ------- | -------------------------------------------------------------- |
| In-memory records                            | 52,555  | 110 days × 12 locations, generated in the browser              |
| Mount time                                   | 64.7 ms | includes dataset generation + first table render               |
| Rows in the DOM                              | 23–34   | constant regardless of dataset size — the virtualization proof |
| p95 frame during scripted full-height scroll | 10.2 ms | under the 16.7 ms 60 fps budget                                |

The benchmark page mounts the same table primitives the Calls page uses, with no
network involved, so the numbers isolate render cost. The frame probe samples
`requestAnimationFrame` deltas while the container is programmatically scrolled
end-to-end; p95 is reported rather than the mean because jank lives in the tail.

## Bundle budgets (enforced in CI by size-limit)

| Asset                                  | Compressed size | Budget |
| -------------------------------------- | --------------- | ------ |
| App entry                              | 229 KB          | 360 KB |
| Overview chunk (visx charts)           | 19 KB           | 30 KB  |
| Calls chunk (TanStack Table + Virtual) | 2 KB            | 10 KB  |
| Stylesheet                             | 8 KB            | 12 KB  |

Two honest notes on the entry chunk:

- **MSW ships in the production bundle by design** — it _is_ the backend of this demo
  (ADR-0002). A real deployment would drop roughly 40 KB here.
- The shell imports the date-range picker and Radix primitives because the global
  filter bar lives in the topbar on every route. Splitting them would save initial
  bytes at the cost of filter-bar pop-in; for a dashboard whose users land on
  data-heavy pages, keeping the filters instant is the right trade.

Budgets are ratchets: they sit close above current reality so CI fails on regressions,
and they get tightened, never loosened, as chunks shrink.

## Re-render policy

Measure first, memoize where the profiler shows waste:

- `selectMetricsQueryArgs` is a `createSelector` producing a referentially stable
  query-arg object, so a re-render never causes a spurious RTK Query refetch. Its
  reference stability is unit-tested.
- Query-derived series (`buildTrendChartModel`, leaderboard ranking) are pure
  functions applied at render; they are cheap relative to chart paint and are not
  pre-memoized.
- `React.memo` is deliberately absent. The profiler showed no wasted commits worth
  the indirection at current widget counts; the policy is recorded here so the next
  change re-measures instead of cargo-culting.

## Zero-CLS loading

Every widget's skeleton is dimension-locked to its loaded layout (`KpiStatTile`
reserves its exact height; `ChartCard` bodies have a fixed minimum height), and
background refetches overlay a shimmer on stale data instead of unmounting it — so
filter changes never reflow the page.

## Lighthouse

Captured against the deployed URL after each production deploy; scores live in the
README table. Local approximation: `pnpm build && pnpm --filter @pulseboard/dashboard preview`,
then audit `http://localhost:4173` in Chrome DevTools.
