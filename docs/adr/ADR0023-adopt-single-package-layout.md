# ADR 0023: Adopt Single-Package Layout

- Status: Accepted
- Created: 2026-11-08
- Updated: 2026-11-08
- Supersedes: ADR 0007

## Context

ADR 0004 split the repository into two npm workspaces: `apps/web` for the SPA and `packages/shared` for contracts shared across packages. ADR 0007 collapsed them into a single package, because:

- `packages/shared` never grew beyond a placeholder (`export {}`), and nothing outside `apps/web` used it.
- The product has one frontend surface, so the workspace boundary added npm workspace, `tsc -b` and duplicate-config overhead without isolating anything that needed it.

ADR 0007 also bundled two other decisions, folder boundaries enforced by ESLint and the TypeScript config layout. The second of these changed, so ADR 0007 is superseded and each of its decisions now has its own ADR. This ADR restates the package layout, which is unchanged.

## Decision

The repository is a single npm package:

- One `package.json` and one `src/` at the repository root, with no npm workspaces.
- [`docs/standards/project-structure-standard.md`](../standards/project-structure-standard.md) defines the folder layout and import rules. Code shared between modules lives in `src/shared/`, as [ADR 0016](ADR0016-modules-own-their-code-by-default.md) decides.
- [ADR 0024](ADR0024-folder-boundaries-are-enforced-by-eslint.md) decides how the folder boundaries are enforced, and [ADR 0025](ADR0025-type-check-app-and-node-code-with-separate-configs.md) decides how TypeScript configs split the code.

## Alternatives Considered

- Keep the two-workspace layout and start using `packages/shared`. Rejected: the workspace overhead stays whether or not `packages/shared` has content, and nothing needs shared contracts to be physically out of the app's reach.

## Consequences

- Positive: one install, one build and one place to look when tracing an import.
- Negative: if the product grows a second frontend surface, such as a native app or an admin tool, shared contracts have to move into a real package then. This is deferred on purpose until a second consumer justifies it.
