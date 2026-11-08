# ADR 0024: Folder Boundaries Are Enforced by ESLint

- Status: Accepted
- Created: 2026-11-08
- Updated: 2026-11-08
- Supersedes: ADR 0007

## Context

The repository is a single npm package ([ADR 0023](ADR0023-adopt-single-package-layout.md)), so no package boundary keeps code apart. The boundaries still matter: modules own their code ([ADR 0016](ADR0016-modules-own-their-code-by-default.md)), and UI code reaches the backend only through data access ([ADR 0017](ADR0017-data-access-maps-backend-rows-to-domain-types.md)). Without a package boundary, something else has to stop an import that crosses them.

This decision was first made in ADR 0007, together with the package layout and the TypeScript config layout. ADR 0007 is superseded, and this ADR restates the boundary decision unchanged.

## Decision

Enforce the folder boundaries with `eslint-plugin-boundaries`:

- [`docs/standards/project-structure-standard.md`](../standards/project-structure-standard.md) defines the folders and which may import which.
- `eslint.config.mjs` holds the `eslint-plugin-boundaries` policy that enforces it, and fails the lint on an import the standard forbids.

## Alternatives Considered

- Rely on code review alone. Rejected: a forbidden import, such as UI code calling Supabase directly, is easy to miss in review.
- Package boundaries, with each boundary as its own npm workspace. Rejected: [ADR 0023](ADR0023-adopt-single-package-layout.md) decides on a single package.

## Consequences

- Positive: the lint rules can express finer boundaries than packages can, such as "UI may not import Supabase directly".
- Negative: the boundaries hold only while ESLint runs and is configured correctly. A missing or misconfigured rule is a silent regression, where a package boundary would fail the TypeScript check or the build.
