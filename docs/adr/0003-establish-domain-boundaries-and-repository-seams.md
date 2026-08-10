# ADR 0003: Establish Domain Boundaries and Repository Seams

- Status: Accepted
- Date: 2026-07-21

## Context

Ricochet App will grow across player management, tournament operations, and role-aware access workflows. If UI code directly depends on backend SDK calls as feature count grows, boundaries become unclear and behavior is harder to test or evolve safely.

## Decision

Adopt explicit domain boundaries and repository seams:

- Organize application behavior into domain modules:
  - players
  - tournaments
  - auth/access
- Enforce a boundary where UI components depend on domain repositories/services.
- Prohibit direct backend client access from UI components.
- Keep infrastructure-specific adapters behind repository/service interfaces.

## Consequences

- Positive:
  - Domain behavior is easier to test without UI or backend coupling.
  - Infrastructure changes (for example, Supabase adapter changes) stay localized.
  - AI-generated code has clearer seams and lower risk of cross-layer leakage.
- Tradeoffs:
  - Requires maintaining repository/service interfaces and adapters.
  - Simple features may feel slightly more verbose at first.

## Alternatives Considered

- Direct SDK access from components/hooks: faster to start, but weaker boundaries and more coupling.
- Centralized repository/service interfaces per domain: chosen for long-term maintainability and replaceable infrastructure.

## Notes

The concrete folder mapping for these domain modules (`src/domain/*`, `src/client-api/*`) and how the boundary is enforced by lint rules are defined in ADR 0007 and `docs/standards/project-structure.md`, superseding the mapping originally in ADR 0004.