# ADR 0025: Type-Check App and Node Code with Separate Configs

- Status: Accepted
- Created: 2026-11-08
- Updated: 2026-11-08
- Supersedes: ADR 0007

## Context

App code runs in the browser and must not use Node APIs. Tests, test tooling and the root `*.config.ts` files run in Node and need Node types. One TypeScript config can't serve both, so the code is type-checked with two.

ADR 0007 made `tsconfig.json` the app config and added `tsconfig.node.json` for the Node code, with no TypeScript project references. The command line checked both, but the editor's TypeScript server reads only the `tsconfig.json` nearest to a file. Test and config files weren't in it, so the editor opened them with default settings: `@/` imports didn't resolve, and the editor showed errors that `npm run typecheck` didn't, and missed some it did.

The editor follows a `tsconfig.json`'s `references` to find the config that includes a file. ADR 0007 had ruled out project references, but its reasons were about references between npm workspaces and the `tsc -b` builds they needed. Here, references only tell the editor which config covers which file, inside one package.

## Decision

Split the TypeScript config into three files:

- `tsconfig.app.json` covers the app code under `src/`, without its test files, and loads only `vite/client` types, so app code can't use Node APIs.
- `tsconfig.node.json` extends it and adds Node types. It covers `tests/`, the test files under `src/` and the root `*.config.ts` files.
- `tsconfig.json` is a solution-style config: `"files": []` and `references` to the two configs above, so the editor opens each file with the config that includes it. It also repeats the `@/` entry of `compilerOptions.paths`, because the shadcn CLI reads only this file to resolve `components.json` aliases.

`npm run typecheck` runs `tsc --noEmit -p` on each of the two configs. The references only pick a config per file. They don't link packages, and nothing builds with `tsc -b`.

## Alternatives Considered

- Make `tsconfig.json` the Node config, covering all files, and narrow `tsconfig.app.json` to the app code. Rejected: the editor would open app code with Node types, so it would accept Node APIs there that `npm run typecheck` rejects.
- Keep `tsconfig.json` as the app config and accept that the editor doesn't know the Node config. Rejected: the editor shows false errors in test and config files, and misses real ones.
- Type-check with `tsc -b` over the references. Rejected: it adds incremental-build state in `.tsbuildinfo` files, which a check that emits nothing doesn't need.

## Consequences

- Positive: the editor opens each file with the config `npm run typecheck` checks it with, so it reports the same type errors, including a Node API used in app code. The exception is the app files that `tsconfig.node.json` also includes for their global declarations: the editor opens them with the app config only.
- Negative: `tsc --noEmit` without `-p` checks nothing, because the root config has no files of its own. Use `npm run typecheck`.
- Negative: the `@/` path is declared in both `tsconfig.json` and `tsconfig.app.json`, and the two must stay in sync. Without the root entry, `shadcn add` writes components into a literal `@/` folder instead of `src/`.
