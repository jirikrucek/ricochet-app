# ADR 0004: Adopt Monorepo Layout for App, Shared Contracts, and Styling

- Status: Accepted
- Date: 2026-07-21

## Context

Ricochet App needs a structure that preserves FE/BE decoupling, keeps shared contracts explicit, and supports long-term maintenance with AI-assisted implementation. Without an agreed layout, feature code, contracts, and styling assets can drift into ad hoc locations and increase coupling.

## Decision

Adopt a monorepo layout with explicit workspace boundaries:

- `apps/web`: frontend SPA application code.
- `packages/shared`: shared contracts (types, validation schemas, repository interfaces).
- `packages/styling`: design tokens and styling primitives reused across app surfaces.

Within `apps/web/src`, organize feature code by domain modules aligned with ADR 0003:

- `domains/players`
- `domains/tournaments`
- `domains/auth`

Keep repository-level docs and architecture records at root and under `docs/adr`, and keep OpenSpec assets under the existing `openspec` directory used by this codebase.

## Consequences

- Positive:
  - Clear separation between app code, shared contracts, and styling assets.
  - Lower coupling and easier migration/refactoring at package boundaries.
  - Better discoverability for contributors and AI agents.
- Tradeoffs:
  - Introduces additional package boundaries and workspace wiring overhead.
  - Requires discipline to prevent shared package sprawl.

## Alternatives Considered

- Single-package app with colocated contracts and styling: simpler initially, but increases coupling and weakens boundary clarity over time.
- Domain packages per feature from day one: stronger isolation, but unnecessary upfront complexity for current project scope.

## Notes

This ADR defines repository structure and ownership boundaries. Technology decisions remain in ADR 0001 and ADR 0002.