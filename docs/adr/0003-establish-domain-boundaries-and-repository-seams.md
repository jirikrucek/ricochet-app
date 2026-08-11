# ADR 0003: Establish Domain Boundaries and Repository Seams

- Status: Accepted
- Created: 2026-07-21
- Updated: 2026-08-11

## Context

Ricochet App will grow across player management, tournament operations, and role-aware access workflows. If UI code directly depends on backend SDK calls as feature count grows, boundaries become unclear and behavior is harder to test or evolve safely.

The original version of this ADR left the repository/service seam underspecified. The concrete implementation let `client-api` both call Supabase and translate rows into domain types, which meant `client-api` depended on `domain` — reducing it to a less swappable, less testable adapter than a "dumb" infrastructure layer should be — and nothing stopped a component deep inside a feature from importing `client-api` directly, bypassing the intended seam. The refinement below (2026-08-11) closes both gaps without adding a new architectural layer.

## Decision

Adopt explicit domain boundaries and repository seams:

- Organize application behavior into domain modules:
  - players
  - tournaments
  - auth/access
- Enforce a boundary where UI components depend on domain repositories/services.
- Prohibit direct backend client access from UI components.
- Keep infrastructure-specific adapters behind repository/service interfaces.

Refined mechanism (2026-08-11):

- `client-api` holds no domain knowledge: it calls Supabase and returns raw or generated (`database.types.ts`) row shapes, and depends on nothing but generic utilities.
- `domain` owns the translation from infrastructure shapes to domain types, as a plain mapper function per module (e.g. `toPlayer(row): Player`). A mapper declares its own expected input shape rather than importing `client-api`'s generated types, so `domain` still depends on nothing else in `src/`.
- Each feature's `api/` subfolder (its TanStack Query hooks) is the *only* part of a feature allowed to import `client-api`. It calls the repository, runs the result through the domain mapper, and returns a domain type — feature components and stores only ever see domain types, never infrastructure shapes.
- A separate top-level `service/` layer (controller → service → repository, as in Spring Boot) was considered and rejected as the mechanism for this: it risks anemic pass-through files for simple CRUD. Colocating the mapping inside each feature's existing `api/` query hook achieves the same isolation without a redundant layer, since that hook already has to exist and already has real responsibility (async state, caching, error handling).

## Consequences

- Positive:
  - Domain behavior is easier to test without UI or backend coupling.
  - Infrastructure changes (for example, Supabase adapter changes) stay localized.
  - AI-generated code has clearer seams and lower risk of cross-layer leakage.
  - `client-api` stays a fully swappable, domain-agnostic adapter — it could be regenerated or replaced without touching a single mapping rule.
  - The mapping seam is enforced by a lint boundary (`features/*/api/**` only, via `eslint-plugin-boundaries`), not just convention — a component can't accidentally reach past it.
- Tradeoffs:
  - Requires maintaining repository/service interfaces and adapters.
  - Simple features may feel slightly more verbose at first.

## Alternatives Considered

- Direct SDK access from components/hooks: faster to start, but weaker boundaries and more coupling.
- Centralized repository/service interfaces per domain: chosen for long-term maintainability and replaceable infrastructure.
- A separate top-level `service/` layer (Spring Boot-style controller → service → repository): considered during the 2026-08-11 refinement and rejected as the mechanism — see "Refined mechanism" above.

## Notes

The concrete folder mapping for these domain modules (`src/domain/*`, `src/client-api/*`) and how the boundary is enforced by lint rules are defined in ADR 0007 and `docs/standards/project-structure.md`, superseding the mapping originally in ADR 0004.