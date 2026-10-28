| Term | Definition | Use When | Avoid |
| --- | --- | --- | --- |
| Seed data | Fictional rows loaded by `supabase/seed.sql` into local and CI databases, used by local development, integration tests, and E2E tests. | Describing the database content tests and local development run against. | fixture data, test data, real data |
| Mock data | Fictional in-code fixtures used only by unit tests, never stored in a database. | Describing data a unit test builds or imports instead of querying Supabase. | seed data, stub data |
| Production data | Real rows that exist only in the hosted Preview and Production Supabase projects, loaded by hand with a script kept outside Git. | Describing real players or any other data that must not reach local, CI, or the repo. | seed data, migration data |
