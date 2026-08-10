# 0006 — RTK Query for server state; the local-state rule

## Context

The role this project targets values Redux; the app needs cached server state
plus a small amount of cross-page UI state.

## Decision

RTK Query owns server state through a single injected api slice with a
retrying base query (two retries, 5xx/network only). Redux slices hold state
with more than one consumer outside its owning subtree: global filters
(date range + locations, synced to the URL by listener middleware), and api
health (two failures inside 30 s flips a degraded banner; any success clears
it). Everything else — table sort, search drafts, popover state — stays local
to its route, mirrored to the URL where shareability matters.

## Consequences

`selectMetricsQueryArgs` memoizes the query-arg object so re-renders never
cause spurious refetches (reference stability is unit-tested). With no
mutations, cache tags exist for one purpose: the banner's retry-all
invalidation — they are deliberately not a per-id taxonomy.
