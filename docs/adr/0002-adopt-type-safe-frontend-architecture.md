# ADR 0002: Adopt Type-Safe Frontend Architecture

- Status: Accepted
- Date: 2026-07-21

## Context

Ricochet App has complex flows (player management, tournament setup, live scoring, standings) and will be implemented iteratively with AI-assisted development. We need strong compile-time guardrails, clear module boundaries, and maintainable UI composition.

## Decision

Adopt a type-safe frontend architecture with explicit state boundaries and headless primitives:

- Routing:
  - Use TanStack Router with file-based routes and typed path/search params.
- Server state:
  - Use TanStack Query for fetching, caching, invalidation, optimistic updates, and async state lifecycle.
- Client state:
  - Keep ephemeral/local state in React component state.
  - Use Zustand only for shared client UI state that should not live in URL or server cache.
- URL state:
  - Keep filters, tabs, and shareable screen state in route search params.
- Forms and validation:
  - Use React Hook Form for form state.
  - Use Zod schemas for runtime validation and static type inference.
- UI system:
  - Use Shadcn UI components with Tailwind CSS and CSS design tokens.
  - Use TanStack Table for data-heavy table views; introduce TanStack Virtual when dataset size requires virtualization.
- FE/BE decoupling:
  - React components do not call backend clients directly.
  - Access data via repository/service interfaces and shared contracts.

## Consequences

- Positive:
  - Strong type safety across navigation, API interactions, and input validation.
  - Better separation of concerns between server state, client state, and URL state.
  - Maintainable UI styling through token-based design.
  - Easier AI-assisted changes due to predictable patterns and localized responsibilities.
- Tradeoffs:
  - Requires team discipline to avoid bypassing repositories or mixing state layers.
  - Adds initial architectural setup overhead versus ad hoc feature coding.

## Alternatives Considered

- React Router as routing baseline: viable, but weaker built-in typed URL/search ergonomics.
- RTK Query as server-state layer: viable when Redux is already central, but adds store/middleware overhead for this app's preferred architecture.
- Formik/Yup for forms: viable, but lower performance/ergonomics for this stack compared with RHF + Zod.