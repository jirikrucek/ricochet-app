# Glossary Reference

| Term | Source Glossary | Context |
| --- | --- | --- |
| Player | `glossary/business.md` | The data the D3 fetch-all decision reads, and the real people whose rows must stay out of tests (ADR 0011). |
| Player overview | `glossary/business.md` | The first table in the app, the reason for ADR 0010. |
| Nationality | `glossary/business.md` | One of the two filters in the table query function (ADR 0010). |
| Sex | `glossary/business.md` | One of the two filters in the table query function (ADR 0010). |
| Surname prefix | `glossary/business.md` | Ignored by the sort comparator, one reason a table library's sorting wouldn't help (ADR 0010). |
| Surname suffix | `glossary/business.md` | The last sort tie-breaker in the comparator (ADR 0010). |
| Seed data | `glossary/technical.md` | The only database content integration and E2E tests may reach (ADR 0011). |
| Mock data | `glossary/technical.md` | The only data unit tests use, including tests of the table query function (ADR 0010, ADR 0011). |
| Production data | `glossary/technical.md` | Real rows that tests must never reach, enforced by the localhost-only helper (ADR 0011). |
