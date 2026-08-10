# 0001 — Vite SPA over Next.js

## Context

Pulseboard models the kind of product that ships inside a desktop client: an
operations dashboard that lives behind a login in real life. Nothing here needs
SEO, server rendering, or per-request data.

## Decision

Build a client-only SPA with Vite, React 19 and React Router (library mode).
Deep links work through a single SPA rewrite on the host.

## Consequences

No SSR machinery to maintain; the mental model matches a desktop web client.
First paint depends on the JS bundle, so bundle budgets are enforced in CI
(size-limit) and route-level code splitting keeps page chunks small.
