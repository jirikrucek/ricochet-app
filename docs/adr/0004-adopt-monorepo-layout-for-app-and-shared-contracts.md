# ADR 0004: Adopt Monorepo Layout for App and Shared Contracts

- Status: Superseded by ADR 0007
- Date: 2026-07-21

## Context

Ricochet App needs a structure that preserves FE/BE decoupling, keeps shared contracts explicit, and supports long-term maintenance with AI-assisted implementation. Without an agreed layout, feature code and contracts can drift into ad hoc locations and increase coupling.

An earlier version of this ADR introduced a separate `packages/styling` workspace for design tokens and styling primitives. That separation turned out to be unnecessary because the product has only one frontend surface: `apps/web`. The extra package boundary added dependency and build overhead without providing real reuse or isolation benefits.

## Decision

Adopt a monorepo layout with explicit workspace boundaries:

- `apps/web`: frontend SPA application code, including its Tailwind theme tokens and styling primitives.
- `packages/shared`: shared contracts (types, validation schemas, repository interfaces).

Within `apps/web/src`, organize feature code by domain modules aligned with ADR 0003:

- `domains/players`
- `domains/tournaments`
- `domains/auth`

Keep repository-level docs and architecture records at root and under `docs/adr`, and keep OpenSpec assets under the existing `openspec` directory used by this codebase.

## Consequences

- Positive:
  - Keeps the only frontend surface self-contained, so styling changes stay close to the components they serve.
  - Preserves a clear boundary between app code and shared contracts without inventing an extra workspace.
  - Reduces workspace, dependency, and TypeScript project-reference overhead.
- Tradeoffs:
  - If the product later gains another frontend surface, shared styling will need to be extracted intentionally at that time.
  - Requires discipline to keep styling organized inside `apps/web` instead of letting it sprawl.

## Alternatives Considered

- Separate `packages/styling` workspace for shared styling: rejected because there is no second frontend surface to justify the extra boundary.
- Single-package app with colocated contracts and styling: simpler initially, but weakens the distinction between app code and cross-package contracts.
- Domain packages per feature from day one: stronger isolation, but unnecessary upfront complexity for current project scope.

## Notes

This ADR defines repository structure and ownership boundaries. Technology decisions remain in ADR 0001 and ADR 0002.
