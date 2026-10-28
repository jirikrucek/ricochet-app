# ADR 0015: Shadcn Components Use Base UI Primitives

- Status: Accepted
- Created: 2026-10-28
- Updated: 2026-10-28

## Context

ADR 0002 adopts Shadcn UI for the component system. Shadcn generates components on top of a headless primitive library, and its usual default is Radix UI. Shadcn also officially supports Base UI, built by core authors of Radix and more actively maintained.

## Decision

Generate Shadcn components with the `base-nova` style (`components.json`), so the components in `src/ui/` are built on `@base-ui/react` primitives. Radix UI packages are not used.

## Alternatives Considered

- Radix UI primitives, Shadcn's usual default. Rejected: Radix is less actively maintained, and Base UI is its successor from the same core authors.

## Consequences

- Positive: the primitives come from an actively maintained library that Shadcn supports officially.
- Negative: Shadcn examples, blocks and third-party components written for Radix need adapting before use. Base UI composes elements with a `render` prop where Radix uses `asChild`.
- Negative: fewer community examples and answers exist for Base UI than for Radix.
