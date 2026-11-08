# Project Structure Standard

This project is a single npm package (see [ADR 0023](../adr/ADR0023-adopt-single-package-layout.md)). There is one `package.json`, one `src/`, at the repository root — no `apps/*` or `packages/*` workspaces.

Place every file in the folder its scope below allows, and respect the import rules. They are enforced by `eslint-plugin-boundaries` (see [Enforcement](#enforcement)) — a violation fails `npm run lint`.

This standard uses the terms domain, module, feature and shared code as defined in [`glossary/technical.md`](../../glossary/technical.md).

## Principles

- **Backend first.** Rules that must be trusted (permissions, integrity, scoring, brackets, ranking points) live in Supabase: RLS, constraints, Postgres functions and views, or Edge Functions. Client code can be read and changed by the user, so client checks only give quick feedback ([ADR 0018](../adr/ADR0018-trusted-business-rules-live-in-the-backend.md)).
- **Module first.** Code starts in its module. It moves to `src/shared/` only when a second module, or `app`, needs it ([ADR 0016](../adr/ADR0016-modules-own-their-code-by-default.md)).
- **One term, many representations.** A glossary term means the same in every module, but each module defines its own type with the data it needs. If a module adds real meaning to a term, that meaning gets its own glossary term.
- **Lists page in the backend.** Filtering, sorting and paging a list happen in Supabase, and the browser receives one page and the total. The page size is one constant for the whole app (`itemsPerPage` in `src/config/pagination.ts`), never view state ([ADR 0020](../adr/ADR0020-lists-are-filtered-sorted-and-paged-in-the-backend.md)).
- **Thin routes.** A route maps a URL to a feature and validates its search params. The logic belongs to the feature.
- **Folders on demand.** A folder is created with its first file. The layout below lists folders that don't exist yet because their rules are already defined.

## Folder layout

```text
ricochet-app/
├── public/                     # Static assets served as-is (favicon) — not imported by code
├── src/
│   ├── main.tsx                # Entry point
│   ├── router.tsx              # Router instance
│   ├── routeTree.gen.ts        # Generated and gitignored — do not hand-edit
│   ├── vite-env.d.ts
│   │
│   ├── routes/                 # TanStack Router file-based routes
│   ├── app/                    # App shell, built once
│   │   ├── AppProviders.tsx
│   │   ├── AppErrorBoundary.tsx
│   │   └── layout/             # Global chrome: TopNav, AppFooter, language selector
│   ├── modules/
│   │   └── <module>/
│   │       ├── features/
│   │       │   └── <feature>/  # Orchestration of one use case and its hooks
│   │       ├── ui/             # Components that get their data through props
│   │       ├── data-access/    # Query hooks
│   │       │   └── api/        # Backend calls, row types, mappers
│   │       └── domain/         # Domain types, their schemas, pure helpers
│   ├── shared/                 # Used by two or more modules, or by a module and app
│   │   ├── ui/
│   │   ├── data-access/
│   │   │   └── api/
│   │   └── domain/
│   ├── ui/                     # Shadcn primitives and cn
│   ├── db/                     # Supabase client, generated database types, RLS test
│   ├── lib/                    # Third-party setup: Sentry, i18next, QueryClient
│   ├── config/                 # Static settings
│   ├── locales/                # Translations and the list of supported languages
│   ├── styles/                 # Tailwind directives and CSS design tokens (globals.css)
│   └── assets/                 # Bundler-processed static assets (brand/, flags/)
│
├── supabase/                   # Migrations, seed.sql, config.toml, and backend business logic
├── tests/
│   ├── e2e/                    # Playwright specs and their shared fixture (fixtures.ts)
│   │   └── internals/          # Internals tests: how the app or its test setup is built, covered by no spec scenario
│   └── support/                # Test tooling: local Supabase env helpers for Vitest and Playwright, the spec scenario coverage check, the preview server's headers, the Sentry envelope reader
├── glossary/                   # Domain and technical terms
├── docs/
└── openspec/
```

Config files (TypeScript, ESLint, Vite, Vitest, Playwright, Tailwind, `components.json`, `vercel.json`) sit at the repository root. `tsconfig.app.json` covers the app; `tsconfig.node.json` covers what runs in Node: tests, `tests/support/` and the `*.config.ts` files. `tsconfig.json` references the two and repeats the `@/` path for the shadcn CLI ([ADR 0025](../adr/ADR0025-type-check-app-and-node-code-with-separate-configs.md)).

Unit and integration tests stay colocated with the source they test (`*.unit.test.ts`, `*.integration.test.ts`). Only Playwright e2e specs live under a separate `tests/e2e/` folder.

Any layer can have subfolders to organize its code, such as `domain/types/` or `domain/utils/`. They carry no import rules of their own: lint checks the layer as a whole. Add them when a folder grows, not before. The exception is `data-access/api/`, which is a layer of its own.

## Folder responsibilities

A module's layers and their counterparts in `src/shared/` hold the same kind of code. They differ only in how many modules use it.

| Folder | Scope & allowed artifacts |
| :--- | :--- |
| `features/<feature>/` | The orchestration of one use case: the component a route renders, and the hooks that handle its URL, focus and other flow. It connects `ui/`, `data-access/` and `domain/`, and is the only layer that reaches its module's `data-access/`. |
| `ui/` | Components, their prop types, and form schemas. Components get data through props and call no backend code. Hooks that serve only these components go here too. |
| `data-access/` | TanStack Query hooks with their query keys and cache settings. This is what features use to reach the backend. |
| `data-access/api/` | Code that talks to the backend (Supabase, a REST API): queries, row and DTO types, and mappers. A mapper turns a row into a domain type and validates it with that type's schema, so the rest of the app never sees rows ([ADR 0017](../adr/ADR0017-data-access-maps-backend-rows-to-domain-types.md)). Only `data-access/` hooks call it. No React, TanStack or i18next. |
| `domain/` | The module's representation of glossary terms: domain types, the Zod schemas they are inferred from, those schemas' constants (e.g. `playerSchema` → `Player`, `nationalities`), and pure helpers (e.g. `formatSurname`). Knows nothing about storage: no column names. Pure: no React, TanStack, i18next or `fetch`. Trusted rules don't belong here; see Backend first. |
| `src/routes/` | Route definitions and search param validation. Routes import the screen from a feature and its search schema from a module's `domain/`. |
| `src/app/` | The app shell: provider wiring, global layout chrome, and the error boundary. It composes features but owns none of their logic. |
| `src/shared/` | `ui/`, `data-access/` and `domain/`, for code two or more modules use, or a module and `app`. Nothing else goes here. |
| `src/ui/` | Shadcn primitives and `cn`. Domain-agnostic — must work with any product, not just Ricochet. |
| `src/db/` | The Supabase client, the generated `supabase.types.ts`, and the row-level security test. Only the `data-access/api/` folders import it. |
| `src/lib/` | Third-party tools configured once at startup (e.g. `sentry.ts`, `i18n.ts`, `queryClient.ts`). A configured REST client belongs in `data-access/api/` instead. |
| `src/config/` | Static app settings with no better owner, such as the page size every list uses. |
| `src/locales/` | One translation file per language, `resources.ts`, and `languages.ts` (supported languages and their metadata). |
| `src/styles/` | Tailwind theme tokens and global CSS. No JS/TS other than the test that checks the tokens. Components use tokens through Tailwind classes. |
| `src/assets/` | Static files imported by code and processed by the bundler (as opposed to `public/`, which is copied verbatim). |

Server data belongs to TanStack Query, and shareable view state belongs to the URL. Where client UI stores go is decided when the first real use case appears ([ADR 0002](../adr/ADR0002-adopt-type-safe-frontend-architecture.md)).

### Choosing between folders

- **`features/` or `ui/`?** If it loads data, reads the URL or coordinates a flow, it belongs to a feature. If it renders what its props say, it belongs in `ui/`.
- **Where does a hook go?** A hook that talks to the backend goes in `data-access/`. A hook that orchestrates one use case goes in its feature. Any other hook goes in `ui/`.
- **`domain/` or `data-access/api/`?** A domain type and its schema go in `domain/`. A shape that exists only because of the backend, such as a row, goes in `data-access/api/`.
- **`domain/` or `ui/`?** A schema that defines what something is goes in `domain/`. A schema for one form goes next to that form.
- **`domain/` or the backend?** If the result must be trusted, it belongs in Supabase. If it only decides how something looks or which view is shown, it can stay in `domain/`.
- **`lib/` or `config/`?** If it sets up a third-party tool, it goes in `lib/`. If it is plain settings, it goes in `config/`.

## Imports

Inside `src/`, import a file in the same folder or below it with `./` (`./PlayerTable`). Import anything else with the `@/` alias (`@/modules/players/domain/types/player`). Never use `../`. ESLint enforces this (`no-restricted-imports`).

## Import rules

"Own" means the same module. Files can also import others in the same layer, and any layer can import from `assets/`.

| Layer | May import |
| :--- | :--- |
| `routes` | `app`; any module's `features`, `domain` |
| `app` | any module's `features`; `shared/ui`, `shared/data-access`, `shared/domain`; `ui`, `lib`, `config`, `locales/languages.ts` |
| Module `features` | own `ui`, `data-access`, `domain`; `shared/ui`, `shared/data-access`, `shared/domain`; `ui`, `config`, `lib/sentry.ts`, `locales/languages.ts` |
| Module `ui` | own `domain`; `shared/ui`, `shared/domain`; `ui`, `config`, `locales/languages.ts` |
| Module `data-access` | own `data-access/api`, `domain`; `shared/data-access`, `shared/domain`; `config`, `lib/sentry.ts` |
| Module `data-access/api` | own `domain`; `shared/data-access/api`, `shared/domain`; `db`, `config` |
| Module `domain` | `shared/domain` |
| `shared/ui` | `shared/domain`; `ui`, `config`, `locales/languages.ts` |
| `shared/data-access` | `shared/data-access/api`, `shared/domain`; `config`, `lib/sentry.ts` |
| `shared/data-access/api` | `shared/domain`; `db`, `config` |
| `shared/domain` | nothing else |
| `lib` | `config`, `locales` |
| `ui`, `db`, `config`, `locales` | nothing else |
| `styles` | nothing else; only `main.tsx` imports it |

`main.tsx` and `router.tsx` start the app and sit outside these rules.

Rules of thumb:

- **Modules never import other modules, and features never import other features.** Code that a second module needs moves to `src/shared/`, and code that a second feature needs moves to the module's `ui/`, `data-access/` or `domain/`. Only `routes` and `app` work across modules.
- **Only features reach a module's `data-access`.** A `ui` component that needs backend data gets it through props, or the code that needs it becomes a feature. `routes` go through a feature, and `app` can also use `shared/data-access`.
- **Only `data-access` hooks reach `data-access/api`.** A feature calls `usePlayersPage`, never `fetchPlayersPage`, because the hook owns the query key and cache settings.
- **Only `db` and the `data-access/api` folders import `@supabase/supabase-js`.** Supabase Auth, Realtime and Storage calls follow the same path as queries.
- **`domain` and `data-access/api` don't use React.** They also don't use TanStack or i18next. `domain` doesn't call `fetch` either.
- **Components get translations from `useTranslation`, not from `lib/i18n`.** Calling `i18n.t()` directly doesn't re-render a component when the language changes. Likewise, use `useQueryClient`, not `lib/queryClient`.
- **Features and `data-access` hooks import only `sentry.ts` from `lib`.** Failed queries and mutations are already reported by the shared `QueryCache` and `MutationCache`. Report only what they can't see, such as a dropped Realtime channel or a failure the code handles itself.
- **`src/ui` stays generic.** A component that needs app or domain knowledge belongs in a module's `ui/` or in `shared/ui/`.
- **Tests of features and `ui` components may import `lib/i18n`.** They render with the configured i18n instance. This is the only test-specific exception.

## Enforcement

The import rules are enforced by [`eslint-plugin-boundaries`](https://github.com/javierbrea/eslint-plugin-boundaries) ([ADR 0024](../adr/ADR0024-folder-boundaries-are-enforced-by-eslint.md)) through the `boundaries/dependencies` policy in `eslint.config.mjs`, which is the source of truth for what is allowed. Change the rules and the policy together, and update the table above to match.

- Each module layer is its own element (`module-features`, `module-ui`, ...), captured per module, so another module's files match no policy. `module-features` is also captured per feature.
- `boundaries/no-unknown-files` rejects a TypeScript file outside every element, so a new top-level folder, a new folder in a module or in `src/shared/`, or a loose file in a module root fails until it is added to this standard and the policy. Only `src/main.tsx`, `src/router.tsx`, `src/routeTree.gen.ts` and `src/vite-env.d.ts` are exempt.
- `assets/` has no element, because unclassified imports aren't checked. This is what lets every layer use it.
- Parent-relative imports (`../`) and `console.*` are rejected in `src/` by separate ESLint rules; see [Imports](#imports).
- `domain/` and `data-access/api/` reject imports of React, TanStack and i18next through ESLint overrides, and `domain/` also rejects the `fetch` global.
