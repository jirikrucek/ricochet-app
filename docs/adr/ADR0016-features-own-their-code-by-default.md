# ADR 0016: Features Own Their Code by Default

- Status: Accepted
- Created: 2026-11-02
- Updated: 2026-11-02
- Supersedes: ADR 0012

## Context

ADR 0012 put domain types and business rules in a shared `src/domain/`, and Supabase access in a shared `src/repositories/`, with one folder per domain module in each. It expected features to reuse the same types, because tournaments will show **players**.

The **player overview** was the first feature built on that structure, and reviewing it showed three problems:

- `queryPlayers` and `playerOverviewSearch` sat in the shared layer, but only the players feature uses them.
- A tournament needs a different view of a **player** than the **player overview** does, such as points in that tournament. One shared `Player` would collect optional fields that are missing in most views.
- Folders mixed concerns. `src/localization/` held translations, i18next setup and the language selector together.

We want a conventional layout with strong separation of concerns. Players is the only business feature so far, so changing the structure now costs little.

## Decision

Keep code in its **feature** by default, and share it only when a second feature needs it.

- A **feature** is a business area, not a screen. A player overview and a player detail both belong in `src/features/players/`. The expected areas are players, tournaments and auth/access.
- Each feature can have `api/`, `components/`, `hooks/`, `store/`, `types/` and `utils/` subfolders.
- Each of those subfolders has a **global counterpart** directly under `src/`. Code moves there when a second feature needs it, not before.
- Features don't import each other, and global code doesn't import features. Only `routes` and `app` compose features.
- There is no shared domain layer. Each feature defines the **domain types** it needs, for example `Player` and `TournamentParticipant`.
- **Domain types** and the Zod schemas they are inferred from go in `types/`. Pure helpers go in `utils/`.

`docs/standards/project-structure-standard.md` holds the full layout and import rules, and `eslint.config.mjs` enforces them.

## Alternatives Considered

- Keep the shared `src/domain/` from ADR 0012. Rejected: it moves code into a shared layer before anything shares it, and it pushes features towards one `Player` that serves every view.
- One feature per screen, such as `features/player-overview` and `features/player-detail`. Rejected: features can't import each other, so screens sharing a `Player` would have to move it to `src/` immediately or duplicate it.
- Nested slices, such as `features/players/overview` and `features/players/detail`. Rejected: shared code would still sit at `features/players/`, so a feature would mix layers with slices, and ESLint would need a second level of isolation.
- A single `domain/` folder in each feature, holding types and logic together. Rejected: trusted rules live in the backend (ADR 0018), so the folder would hold mostly types and presentation helpers under a misleading name. `types/` and `utils/` are also more conventional.

## Consequences

- Positive: a feature's code sits in one place, so it can be changed or removed without searching the rest of `src/`.
- Positive: each view gets a type with exactly the fields it loads, without optional fields it never uses.
- Negative: features that read the same table each have their own query and mapper, so some mapping is repeated until it moves to a **global counterpart**.
- Negative: a mutation in one feature can't invalidate another feature's query key, because features can't import each other. When that's needed, the key moves to a global counterpart.
- Negative: files that combine a schema with helpers must be split between `types/` and `utils/`, such as `formatSurname` from `player.ts`.

## Notes

- ADR 0012 bundled three decisions. This ADR covers where code lives, ADR 0017 covers how the app reaches the backend, and ADR 0018 covers where business rules live.
