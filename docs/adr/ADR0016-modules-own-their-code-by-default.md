# ADR 0016: Modules Own Their Code by Default

- Status: Accepted
- Created: 2026-11-02
- Updated: 2026-11-03
- Supersedes: ADR 0012

## Context

ADR 0012 put domain types and business rules in a shared `src/domain/`, and Supabase access in a shared `src/repositories/`, with one folder per business area in each. It expected areas to reuse the same types, because tournaments will show **players**.

The **player overview** was the first screen built on that structure, and reviewing it showed four problems:

- `queryPlayers` and `playerOverviewSearch` sat in the shared layer, but only player code uses them.
- A tournament needs a different view of a **player** than the **player overview** does, such as points in that tournament. One shared `Player` would collect optional fields that are missing in most views.
- Folders mixed concerns. `src/localization/` held translations, i18next setup and the language selector together, and `PlayerOverview` orchestrated data and the URL from the same folder as components that only render props.
- "Feature" named a business area in the folder layout, although the word normally means something a user can do.

We want a conventional layout with strong separation of concerns. Players is the only business area with real code so far, so changing the structure now costs little.

## Decision

Organize `src/` by **module**, and keep code in its **module** by default.

- The **domain** is the sport Ricochet. Its terms live in `glossary/`, and each term keeps one meaning across the app.
- A **module** is a business area, currently players and tournaments. Its folder in `src/modules/` is created with its first real code.
- Each **module** can have four layers:
  - `features/<feature>/`: one folder per use case. A **feature** is usually reached through a route. It orchestrates the other layers, and it is the only layer that reaches the **module**'s `data-access/`.
  - `ui/`: components that get their data through props.
  - `data-access/`: backend access (ADR 0017).
  - `domain/`: the **module**'s representation of glossary terms: **domain types**, the Zod schemas they are inferred from, and pure helpers. Rules that must be trusted stay in the backend (ADR 0018).
- **Modules** don't import each other, and **features** don't import each other. Only `routes` and `app` work across **modules**.
- Code moves to `src/shared/`, which has its own `ui/`, `data-access/` and `domain/`, only when a second **module** or `app` needs it. That makes it **shared code**.
- There is no shared domain model. Each **module** defines its own type with the data it needs. If a **module** adds real meaning to a term, that meaning gets its own glossary term, such as a tournament participant with a seed.
- `src/ui/` holds only Shadcn primitives (ADR 0015), so it stays free of app knowledge.

`docs/standards/project-structure-standard.md` holds the full layout and import rules, and `eslint.config.mjs` enforces them.

## Alternatives Considered

- Keep the shared `src/domain/` from ADR 0012. Rejected: it moves code into a shared layer before anything shares it, and it pushes the app towards one `Player` that serves every view.
- Flat feature folders for business areas, each with `api/`, `components/`, `hooks/`, `store/`, `types/` and `utils/`. Rejected: orchestration stays mixed with rendering in `components/`, any component can import a query hook, and "feature" keeps naming an area, not a use case.
- One top-level feature per screen, such as `features/player-overview` and `features/player-detail`. Rejected: features can't import each other, so screens sharing a `Player` would have to duplicate it or move it to shared code immediately.
- `screens/` or `containers/` as the name of the orchestration layer. Rejected: not every use case is a screen, such as a user menu in the top nav, and "feature" names the use case itself.
- Full bounded contexts with their own data, domain events and local copies of other contexts' data. Rejected: all **modules** read one Postgres database under RLS, so there is nothing for events or copies to keep apart.
- `src/modules/shared/` instead of `src/shared/`. Rejected: it isn't a business area, `app` imports it too, and "modules don't import each other" would need an exception.

## Consequences

- Positive: a **module**'s code sits in one place, so it can be changed or removed without searching the rest of `src/`.
- Positive: each view gets a type with exactly the fields it loads, without optional fields it never uses.
- Positive: `ui/` components render what their props say, so tests of them need no query client.
- Negative: paths are deep, such as `src/modules/players/features/player-overview/PlayerOverview.tsx`, and four layers are a lot of structure for one **module** today.
- Negative: **modules** that read the same table each have their own query and mapper, so some mapping is repeated until it becomes **shared code**.
- Negative: a mutation in one **module** can't invalidate another **module**'s query key. When that's needed, the key becomes **shared code**.
- Negative: a deeply nested `ui/` component that needs data receives it through props, or the code around it becomes a **feature**.
- Follow-up: the first real need for client UI state decides where stores go (ADR 0002).

## Notes

- ADR 0012 bundled three decisions. This ADR covers where code lives, ADR 0017 covers how the app reaches the backend, and ADR 0018 covers where business rules live.
