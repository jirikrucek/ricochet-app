# Glossary Reference

| Term | Source Glossary | Context |
| --- | --- | --- |
| Visitor | `glossary/business.md` | Anyone who can read the player data and uses the player overview. |
| Player | `glossary/business.md` | The people shown on the page, real in production and fictional in tests. |
| Player overview | `glossary/business.md` | The `/players` page and the name of the new capability. |
| Nationality | `glossary/business.md` | Stored as an ISO alpha-2 code, shown as a flag, and used as a filter. |
| Sex | `glossary/business.md` | A stored attribute used only as a filter, not shown as a column. |
| Surname prefix | `glossary/business.md` | Particles stored separately so sorting ignores them. |
| Surname suffix | `glossary/business.md` | "jr."/"sr." stored separately and used as the last sort tie-breaker. |
| Seed data | `glossary/technical.md` | Fictional players in `seed.sql` for local development, integration, and E2E tests. |
| Mock data | `glossary/technical.md` | In-code fixtures for unit tests. |
| Production data | `glossary/technical.md` | The 84 real players, loaded by hand and kept out of Git. |
