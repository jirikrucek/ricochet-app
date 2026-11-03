import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

// Row-Level Security is the only access boundary for the browser's
// publishable key (docs/standards/security-standard.md), so every table in
// `public` must have it enabled. The publishable key can't read the catalog,
// so this asks the local database through the Supabase CLI. `--local` keeps
// it off the hosted projects (ADR 0011).
const tablesSql = `
  select c.relname as table_name, c.relrowsecurity as rls_enabled
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind in ('r', 'p')
  order by c.relname`;

// A view runs as its owner unless it says otherwise, which would skip the RLS
// policies of the tables it reads.
const viewsSql = `
  select c.relname as view_name,
    coalesce('security_invoker=true' = any (c.reloptions), false) as security_invoker
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'v'
  order by c.relname`;

type TableRow = { table_name: string; rls_enabled: boolean };
type ViewRow = { view_name: string; security_invoker: boolean };

// `supabase db query -o json` prints a bare array of rows, but wraps them as
// `{ boundary, rows, warning }` when it detects an AI agent (AI_AGENT,
// CLAUDECODE), so accept both shapes.
function queryLocal<TRow>(sql: string): TRow[] {
  const output = execFileSync(
    'npx',
    ['supabase', 'db', 'query', '--local', '-o', 'json', sql],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  );
  const parsed = JSON.parse(output) as TRow[] | { rows?: TRow[] };
  const rows = Array.isArray(parsed) ? parsed : parsed.rows;
  if (!Array.isArray(rows)) {
    throw new Error(`Unexpected supabase db query output: ${output}`);
  }
  return rows;
}

describe('row-level security', () => {
  it('is enabled on every table in the public schema', () => {
    const tables = queryLocal<TableRow>(tablesSql);

    expect(tables.length).toBeGreaterThan(0);
    expect(
      tables.filter((table) => !table.rls_enabled).map((t) => t.table_name),
    ).toEqual([]);
  }, 30_000);

  it('is not skipped by any view in the public schema', () => {
    const views = queryLocal<ViewRow>(viewsSql);

    expect(views.length).toBeGreaterThan(0);
    expect(
      views.filter((view) => !view.security_invoker).map((v) => v.view_name),
    ).toEqual([]);
  }, 30_000);
});
