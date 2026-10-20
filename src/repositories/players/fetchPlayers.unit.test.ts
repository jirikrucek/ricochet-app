import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';

import type { Database } from '../database.types';
import { buildPlayerRow } from './playerRowMocks';
import type { PlayerRow } from './playerRow';

// The module under test imports the Supabase client, which reads these at load.
vi.stubEnv('VITE_SUPABASE_URL', 'http://127.0.0.1:54321');
vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_unit');
const { fetchPlayers, maxRows } = await import('./fetchPlayers');

// Stands in for the Supabase client, the external I/O, and answers the one
// query fetchPlayers makes.
function clientReturning(rows: PlayerRow[]) {
  return {
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({ data: rows, error: null }),
      }),
    }),
  } as unknown as SupabaseClient<Database>;
}

const rows = (count: number) =>
  Array.from({ length: count }, () => buildPlayerRow());

describe('fetchPlayers', () => {
  it('returns every row just under the response cap', async () => {
    const players = await fetchPlayers(clientReturning(rows(maxRows - 1)));

    expect(players).toHaveLength(maxRows - 1);
  });

  it('throws instead of returning a list the response cap may have cut off', async () => {
    await expect(fetchPlayers(clientReturning(rows(maxRows)))).rejects.toThrow(
      /players_fetch_possibly_truncated/,
    );
  });
});
