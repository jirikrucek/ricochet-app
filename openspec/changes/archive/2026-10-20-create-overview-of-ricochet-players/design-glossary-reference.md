# Glossary Reference

| Term | Source Glossary | Context |
| --- | --- | --- |
| Visitor | `glossary/business.md` | The actor in the container diagram who reads players through the SPA with the publishable key. |
| Player | `glossary/business.md` | The rows of the `players` table and the domain `Player` type the read path produces. |
| Player overview | `glossary/business.md` | The `/players` page whose rules the domain query function, URL schema, and UI composition implement. |
| Nationality | `glossary/business.md` | Constrained to six ISO codes in the database and the domain, shown as a flag, and used as a filter. |
| Sex | `glossary/business.md` | Stored as the `player_sex` enum and used as a filter. |
| Surname prefix | `glossary/business.md` | A nullable column, shown in the surname and ignored by the sort comparator. |
| Surname suffix | `glossary/business.md` | A nullable column, shown in the surname and used as the last sort key. |
| Seed data | `glossary/technical.md` | The fictional rows in `supabase/seed.sql` that integration and E2E tests read from the local Supabase. |
| Mock data | `glossary/technical.md` | The in-code fixtures used by unit tests of the mapper, query function, and components. |
| Production data | `glossary/technical.md` | The real players loaded by hand with an idempotent, gitignored script, and never reachable from tests. |
