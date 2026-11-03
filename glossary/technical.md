| Term | Definition | Use When | Avoid |
| --- | --- | --- | --- |
| Seed data | Fictional rows loaded by `supabase/seed.sql` into local and CI databases, used by local development, integration tests, and E2E tests. | Describing the database content tests and local development run against. | fixture data, test data, real data |
| Mock data | Fictional in-code fixtures used only by unit tests, never stored in a database. | Describing data a unit test builds or imports instead of querying Supabase. | seed data, stub data |
| Production data | Real rows that exist only in the hosted Preview and Production Supabase projects, loaded by hand with a script kept outside Git. | Describing real players or any other data that must not reach local, CI, or the repo. | seed data, migration data |
| Feature | A business area of the app with its own folder under `src/features/`, such as players or tournaments, rather than a single screen. | Describing where code lives or which code may import which. | module, slice, domain module |
| Global counterpart | The folder directly under `src/` that holds the same kind of code as a feature subfolder, for code two or more features use, such as `src/hooks/` for `features/*/hooks/`. | Describing where code moves when a second feature needs it. | shared folder, common folder |
| Domain type | A TypeScript type describing a business concept as the app uses it, usually inferred from a Zod schema and free of storage details. | Contrasting what the app works with against backend rows and UI-only types. | model, entity, DTO |
