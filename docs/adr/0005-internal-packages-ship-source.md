# 0005 — Internal packages ship source, not dist

## Context

`@pulseboard/ui` and `@pulseboard/mock-api` are consumed only inside this
monorepo by Vite, Vitest, Storybook and Cypress — all of which compile
TypeScript.

## Decision

Package `exports` point at `./src/*.ts`. No build step, no watch
orchestration, no publishing.

## Consequences

Perfect HMR across packages and one less pipeline. If a package ever needs to
be published or consumed by a non-bundling runtime, a build step gets added
then — not before.
