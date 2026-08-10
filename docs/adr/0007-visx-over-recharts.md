# 0007 — visx over Recharts

## Context

The dashboard needs a line trend with annotation bands, grouped bars, and
sparklines — and charts are a craft signal in this codebase.

## Decision

visx modules (~30–45 KB compressed for this usage) with d3 math and
hand-owned marks; sparklines are 40 lines of raw SVG. Chart colors come from
the semantic `--chart-*` tokens; because SVG presentation attributes cannot
resolve `var()`, colors are applied via style objects.

## Consequences

Every rendered pixel is explicit and theme-aware with zero re-render on theme
flips. Recharts would have been faster to write and ~3× heavier, with default
styling that fights the token system.
