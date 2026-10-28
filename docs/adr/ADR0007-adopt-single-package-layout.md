# ADR 0007: Adopt Single-Package Layout

- Status: Accepted
- Created: 2026-08-10
- Updated: 2026-10-28
- Supersedes: ADR 0004

## Context

ADR 0004 adopted a two-workspace monorepo (`apps/web` for the SPA, `packages/shared` for cross-package contracts) on the reasoning that app code and shared contracts deserved separate ownership boundaries. In practice:

- `packages/shared` never grew beyond a placeholder (`export {}`); nothing outside `apps/web` consumes it, and it is referenced only through TypeScript project references, not real imports.
- The product still has exactly one frontend surface, so the workspace boundary buys isolation nobody needs while adding npm workspace, `tsc -b` project-reference, and duplicate-config overhead.
- `src/domain/` (ADR 0003) already gives contracts and business rules a home that doesn't require a separate package to stay decoupled from UI code — a folder-level boundary enforced by lint rules is enough.

ADR 0004 considered and rejected a single-package layout at the time, on the grounds that it would "weaken the distinction between app code and cross-package contracts." That distinction has not materialized as valuable in practice, and the folder-level `domain` boundary from ADR 0003 turns out to give the same guarantee without a package boundary.

## Decision

Collapse the repository to a single npm package at the root:

- Remove the `apps/*` / `packages/*` npm workspaces. One `package.json`, one `tsconfig.json`, one `src/` at the repo root.
- Fold `packages/shared`'s intended purpose (shared contracts) into `src/domain/shared/`.
- Adopt the folder layout and dependency graph defined in [`docs/standards/project-structure-standard.md`](../standards/project-structure-standard.md), which supersedes the folder mapping previously in ADR 0004.
- Enforce the folder boundaries with `eslint-plugin-boundaries` instead of npm workspace isolation — see `eslint.config.mjs` for the rule set.

This does not change the domain boundaries decided in ADR 0003, now recorded in ADR 0016 (players / tournaments / auth, repository seam between UI and Supabase); it changes how those boundaries are enforced, from a package boundary to a linted folder boundary.

## Alternatives Considered

- Keep the two-workspace layout and simply start using `packages/shared`. Rejected: the workspace/project-reference overhead persists regardless of whether `packages/shared` has real content, and nothing today needs contracts to be physically unreachable from `apps/web`.
- Single package now, without lint-enforced folder boundaries. Rejected: without `eslint-plugin-boundaries`, the "UI never touches Supabase directly" rule from ADR 0003 would rely on code review alone.

## Consequences

- Positive: one install, one build, one typecheck — no project-reference or workspace-hoisting overhead for a product with a single frontend surface.
- Positive: `eslint-plugin-boundaries` gives equivalent (arguably finer-grained) enforcement to workspace isolation: it can express "UI may not import Supabase directly" in a way a package boundary alone could not.
- Positive: fewer places to look when tracing an import — no ambiguity about which workspace a file lives in.
- Negative: boundary enforcement now depends on ESLint running (and being configured correctly) rather than being structurally impossible to violate, as a real package boundary would be. A missing or misconfigured lint rule is a silent regression; a workspace boundary fails at the TypeScript/build level.
- Negative: if the product later grows a second frontend surface (e.g. a native app, an admin tool), shared contracts will need to be re-extracted into a real package at that time — this reintroduces the tradeoff ADR 0004 originally tried to avoid, but deliberately deferred until there is a second consumer to justify it.

## Notes

- Supersedes ADR 0004.
- `docs/standards/project-structure-standard.md` is the source of truth for the concrete folder layout, per-folder responsibilities, and the dependency graph; `eslint.config.mjs` holds the `eslint-plugin-boundaries` policy that enforces it. This ADR records only the shape decision and why it changed from ADR 0004.
