# Project Structure Standard

This project is a single npm package (see [ADR 0007](../adr/ADR0007-adopt-single-package-layout.md)). There is one `package.json`, one `src/`, at the repository root — no `apps/*` or `packages/*` workspaces.

Place every file in the folder its scope below allows, and respect the import rules. They are enforced by `eslint-plugin-boundaries` (see [Enforcement](#enforcement)) — a violation fails `npm run lint`.

## Principles

- **Backend first.** Rules that must be trusted (permissions, integrity, scoring, brackets, ranking points) live in Supabase: RLS, constraints, Postgres functions and views, or Edge Functions. Client code can be read and changed by the user, so client checks only give quick feedback ([ADR 0018](../adr/ADR0018-trusted-business-rules-live-in-the-backend.md)).
- **Feature first.** Code starts in its feature. It moves to the matching global folder in `src/` only when a second feature needs it ([ADR 0016](../adr/ADR0016-features-own-their-code-by-default.md)).
- **A feature is a business area, not a screen.** A player overview and a player detail both belong in `features/players/`. Make a separate feature when the code has its own data and rules, and rarely changes alongside the rest.
- **Features do not share types by default.** Two features that show the same entity each define the type they need, for example `Player` and `TournamentParticipant`, and each has its own query and mapper.
- **Thin routes.** A route maps a URL to a screen and validates its search params. The screen's logic belongs to its feature.
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
│   │   └── layout/             # Global chrome: TopNav, AppFooter
│   ├── features/
│   │   └── <feature>/
│   │       ├── api/            # Backend calls, row types, mappers
│   │       ├── components/     # UI components
│   │       ├── hooks/          # TanStack Query hooks and other React hooks
│   │       ├── store/          # Zustand stores
│   │       ├── types/          # Domain types and the schemas they are inferred from
│   │       └── utils/          # Pure helpers
│   │
│   │   # Global counterparts, for code used by two or more features
│   ├── api/
│   ├── components/
│   ├── hooks/
│   ├── store/
│   ├── types/
│   ├── utils/
│   │
│   │   # Global only
│   ├── ui/                     # Shadcn primitives
│   ├── db/                     # Supabase client, generated database types, RLS test
│   ├── lib/                    # Third-party setup: Sentry, i18next, QueryClient
│   ├── config/                 # Static settings
│   ├── locales/                # Translations and the list of supported languages
│   ├── styles/                 # Tailwind directives and CSS design tokens (globals.css)
│   └── assets/                 # Bundler-processed static assets (brand/, flags/)
│
├── supabase/                   # Migrations, seed.sql, config.toml, and backend business logic
├── tests/
│   ├── e2e/                    # Playwright specs
│   └── support/                # Test tooling: local Supabase env helpers for Vitest and Playwright
├── docs/
└── openspec/
```

Config files (ESLint, Vite, Vitest, Playwright, Tailwind, `components.json`, `vercel.json`) sit at the repository root.

Unit and integration tests stay colocated with the source they test (`*.unit.test.ts`, `*.integration.test.ts`). Only Playwright e2e specs live under a separate `tests/e2e/` folder.

## Folder responsibilities

Feature folders and their global counterparts hold the same kind of code. They differ only in how many features use it.

| Folder | Scope & allowed artifacts |
| :--- | :--- |
| `api/` | Code that talks to the backend (Supabase, a REST API): queries, row and DTO types, and mappers. A mapper turns a row into a domain type and validates it with that type's schema, so the rest of the app never sees rows ([ADR 0017](../adr/ADR0017-api-folders-map-backend-rows-to-domain-types.md)). No React, TanStack or i18next. |
| `components/` | UI components, their prop types, and form schemas. Global `components/` can know about the app and its domain, which is what separates it from `ui/`. |
| `hooks/` | TanStack Query hooks, including their query keys and cache settings, and other React hooks. The only layer that can reach `api/`. Wrap pure logic from `utils/` rather than writing it inline, so it can be tested without React. |
| `store/` | Zustand stores for shared client UI state. Server data belongs to TanStack Query, and shareable view state belongs to the URL. |
| `types/` | Domain types, the Zod schemas they are inferred from, and those schemas' constants (e.g. `playerSchema` → `Player`, `nationalities`). Knows nothing about storage: no column names. Pure: no React, TanStack, i18next or `fetch`. |
| `utils/` | Pure helpers for presentation and view logic (e.g. `formatSurname`, `queryPlayers`, `cn`). Same purity rules as `types/`. |
| `src/routes/` | Route definitions and search param validation. Routes import the screen from a feature's `components/` and its search schema from a feature's `types/`. |
| `src/app/` | The app shell: provider wiring, global layout chrome, and the error boundary. It composes features but owns none of their logic. |
| `src/ui/` | Shadcn primitives. Domain-agnostic — must work with any product, not just Ricochet. |
| `src/db/` | The Supabase client, the generated `database.types.ts`, and the row-level security test. Only the `api/` folders import it. |
| `src/lib/` | Third-party tools configured once at startup (e.g. `sentry.ts`, `i18n.ts`, `queryClient.ts`). A configured REST client belongs in `api/` instead. |
| `src/config/` | Static app settings with no better owner. |
| `src/locales/` | One translation file per language, `resources.ts`, and `languages.ts` (supported languages and their metadata). |
| `src/styles/` | Tailwind theme tokens and global CSS. No JS/TS other than the test that checks the tokens. Components use tokens through Tailwind classes. |
| `src/assets/` | Static files imported by code and processed by the bundler (as opposed to `public/`, which is copied verbatim). |

### Choosing between folders

- **`types/` or `api/`?** A domain type and its schema go in `types/`. A shape that exists only because of the backend, such as a row, goes in `api/`.
- **`types/` or `components/`?** A schema that defines what something is goes in `types/`. A schema for one form goes next to that form.
- **`utils/` or the backend?** If the result must be trusted, it belongs in Supabase. If it only decides how something looks or which view is shown, it belongs in `utils/`.
- **`utils/` or `hooks/`?** If it needs React state or effects, it is a hook. Otherwise it is a util.
- **`lib/` or `config/`?** If it sets up a third-party tool, it goes in `lib/`. If it is plain settings, it goes in `config/`.

## Imports

Inside `src/`, import a file in the same folder or below it with `./` (`./PlayerTable`). Import anything else with the `@/` alias (`@/features/players/types/player`). Never use `../`. ESLint enforces this (`no-restricted-imports`).

## Import rules

"Own" means the same feature, and "global" means the counterpart directly under `src/`. Files can also import others in the same folder, and any layer can import from `assets/`.

| Layer | May import |
| :--- | :--- |
| `routes` | `app`; any feature's `components`, `types` |
| `app` | any feature's `components`; global `components`, `hooks`, `store`, `types`, `utils`; `ui`, `lib`, `config` |
| Feature `components` | own `hooks`, `store`, `types`, `utils`; global `components`, `hooks`, `store`, `types`, `utils`; `ui`, `config`, `locales/languages.ts` |
| Feature `hooks` | own `api`, `store`, `types`, `utils`; global `api`, `hooks`, `store`, `types`, `utils`; `config`, `lib/sentry.ts`, `locales/languages.ts` |
| Feature `api` | own `types`, `utils`; global `api`, `types`, `utils`; `db` |
| Feature `store` | own `types`, `utils`; global `types`, `utils` |
| Feature `utils` | own `types`; global `types`, `utils` |
| Feature `types` | global `types` |
| Global `components` | `ui`; global `hooks`, `store`, `types`, `utils`; `config`, `locales/languages.ts` |
| Global `hooks` | global `api`, `store`, `types`, `utils`; `config`, `lib/sentry.ts`, `locales/languages.ts` |
| Global `api` | `db`; global `types`, `utils` |
| Global `store` | global `types`, `utils` |
| Global `utils` | global `types` |
| Global `types` | nothing else |
| `ui` | global `utils` |
| `lib` | `config`, `locales` |
| `db`, `config`, `locales` | nothing else |
| `styles` | nothing else; only `main.tsx` imports it |

`main.tsx` and `router.tsx` start the app and sit outside these rules.

Rules of thumb:

- **Features never import other features, and global code never imports features.** Code that a second feature needs moves to the global counterpart. The exceptions are `routes` and `app`, which compose features through their `components` (and, for `routes`, the `types` holding search schemas).
- **Only hooks reach `api`.** A component that needs backend data calls a hook. `routes` and `app` go through a feature's components.
- **Only `db` and the `api` folders import `@supabase/supabase-js`.** Supabase Auth, Realtime and Storage calls follow the same path as queries.
- **`api`, `types` and `utils` don't use React.** They also don't use TanStack or i18next. `types` and `utils` don't call `fetch` either.
- **Components get translations from `useTranslation`, not from `lib/i18n`.** Calling `i18n.t()` directly doesn't re-render a component when the language changes. Likewise, use `useQueryClient`, not `lib/queryClient`.
- **Hooks import only `sentry.ts` from `lib`.** Failed queries and mutations are already reported by the shared `QueryCache` and `MutationCache`. A hook reports what they can't see, such as a dropped Realtime channel or a failure it handles itself.
- **`ui` stays generic.** A component that needs app or domain knowledge belongs in `components/`.
- **Component tests may import `lib/i18n`.** They render with the configured i18n instance. This is the only test-specific exception.

## Enforcement

The import rules are enforced by [`eslint-plugin-boundaries`](https://github.com/javierbrea/eslint-plugin-boundaries) through the `boundaries/dependencies` policy in `eslint.config.mjs`, which is the source of truth for what is allowed. Change the rules and the policy together, and update the table above to match.

- Each feature folder is its own element (`feature-api`, `feature-hooks`, ...), captured per feature, so another feature's files match no policy.
- `boundaries/no-unknown-files` rejects a TypeScript file outside every element, so a new top-level folder or a loose file in a feature root fails until it is added to this standard and the policy. Only `src/main.tsx`, `src/router.tsx`, `src/routeTree.gen.ts` and `src/vite-env.d.ts` are exempt.
- `assets/` has no element, because unclassified imports aren't checked. This is what lets every layer use it.
- Parent-relative imports (`../`) and `console.*` are rejected in `src/` by separate ESLint rules; see [Imports](#imports).
- `api/`, `types/` and `utils/` reject imports of React, TanStack and i18next through ESLint overrides, and `types/` and `utils/` also reject `fetch`.
