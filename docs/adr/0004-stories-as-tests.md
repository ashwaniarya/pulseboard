# 0004 — Stories are the component test suite

## Context

Storybook can either drift from the code or be the thing that verifies it.

## Decision

The Storybook Vitest addon runs every story in headless Chromium: render
smoke for all stories, play functions as interaction tests (keyboard
traversal, focus return, selection flows), and axe accessibility checks that
fail CI at `test: "error"`. jsdom RTL tests keep aria-wiring and callback
contracts; play functions own anything needing a real browser.

## Consequences

One runner (Vitest) for unit, component and story tests. Coverage thresholds
(90% lines / 85% branches on `packages/ui`) are computed from the jsdom run
only — browser-mode coverage is not merged, so the three interaction-only
components (Tabs, MultiSelect, Tooltip) are excluded from that report with a
comment. Chasing a merged report was judged ceremony over signal.
