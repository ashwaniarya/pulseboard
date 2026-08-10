# 0003 — Semantic tokens, CSS-first Tailwind 4

## Context

The design system must support light and dark themes and keep components from
hardcoding hues.

## Decision

Semantic custom properties (`--surface`, `--text-muted`, `--accent`,
`--chart-1..6`, …) are defined per theme on `:root` / `[data-theme="dark"]` and
mapped into Tailwind via `@theme inline`. The default palette is wiped
(`--color-*: initial`), so `bg-blue-500` is a build error. The theme attribute
is stamped pre-paint by an inline script (stored preference, else system).

## Consequences

Theme switches are pure CSS — zero re-render. Contrast is enforced twice: a
unit test computes WCAG ratios for every declared pair, and the Storybook axe
gate audits rendered components. Chart colors were additionally validated for
color-vision-deficiency separation and adjusted where the checks failed.
