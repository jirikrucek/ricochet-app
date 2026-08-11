# Security

This project uses Supabase with the client-side anon key exposed to the browser (see [ADR 0001](../adr/0001-adopt-spa-platform-and-core-stack.md)). Row-Level Security (RLS) is the only access control boundary between that key and the database — there is no server tier in front of it.

For any change that adds or edits a Supabase migration:
- Read this file first.

## Row-Level Security

- **Every table must enable RLS in the same migration that creates it.** `alter table ... enable row level security;` is not a follow-up step — a table with RLS disabled is fully readable and writable by the anon key from any browser the moment it lands.
- **A table with RLS enabled and no policies is the safe default** (deny-all). Add policies deliberately, scoped to the narrowest access the feature needs (e.g. `select` only for the row's owner), rather than a broad `using (true)` policy "to get it working."
- **Never bypass RLS in client-facing code.** The service-role key (which bypasses RLS) must never be imported into `src/`; it belongs only in trusted server contexts (Supabase Edge Functions, CI), if used at all.
- **Review new tables/policies for reachability, not just presence.** A policy referencing the wrong column (e.g. comparing `id` instead of `owner_id`) can silently grant access to all rows — treat new policies as security-critical code and test them against the abuse case ("can user B read user A's row?"), not just the happy path.
