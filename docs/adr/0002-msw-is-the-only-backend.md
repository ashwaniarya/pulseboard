# 0002 — MSW is the only backend

## Context

The project needs a realistic ReSTful API — envelopes, pagination, validation
errors, latency — without hosting a server for a demo.

## Decision

Mock Service Worker ships in the production bundle and _is_ the backend. The
same handlers serve dev, Vitest (node), Storybook and Cypress. Data comes from
a seeded deterministic generator: per-(location, family, date) PRNG streams,
so any date's data is identical whenever it is generated and the demo slides
forward daily. Tests and e2e pin `datasetEndDate=2026-08-10` for exact
assertions. Anomaly storylines are positioned relative to the end date so the
demo narrative never ages out; sliding-window equality therefore holds only
with anomalies disabled, which is a documented, tested trade.

## Consequences

Requests are honest HTTP through the service worker, so the app exercises real
fetch paths, retries and error handling. The bundle carries ~40 KB of MSW —
called out in the performance doc. Offset pagination was chosen over cursors
because it matches server-side sorting on an internal dashboard.
