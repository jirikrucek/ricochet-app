import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

// Row-Level Security is the only access boundary for the browser's
// publishable key (docs/standards/security-standard.md), so every table in
// `public` must have it enabled. The publishable key can't read the catalog,
// so this asks the local database through the Supabase CLI. `--local` keeps
// it off the hosted projects (ADR 0011).
const sql = `
  select c.relname as table_name, c.relrowsecurity as rls_enabled
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind in ('r', 'p')
  order by c.relname`;

type TableRow = { table_name: string; rls_enabled: boolean };

function publicTables(): TableRow[] {
  const output = execFileSync(
    'npx',
    ['supabase', 'db', 'query', '--local', '-o', 'json', sql],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  );
  return (JSON.parse(output) as { rows: TableRow[] }).rows;
}

describe('row-level security', () => {
  it('is enabled on every table in the public schema', () => {
    const tables = publicTables();

    expect(tables.length).toBeGreaterThan(0);
    expect(
      tables.filter((table) => !table.rls_enabled).map((t) => t.table_name),
    ).toEqual([]);
  }, 30_000);
});
