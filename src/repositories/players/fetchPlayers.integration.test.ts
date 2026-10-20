import { createClient } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';

import type { Database } from '../database.types';
import { fetchPlayers } from './fetchPlayers';

describe('fetchPlayers', () => {
  it('returns every seeded player as a domain player', async () => {
    const players = await fetchPlayers();

    expect(players).toHaveLength(100);
    expect(players).toContainEqual({
      id: expect.any(Number),
      firstName: 'Pieter',
      surnamePrefix: 'de',
      surname: 'Vries',
      nationality: 'NL',
      sex: 'male',
    });
    expect(players).toContainEqual({
      id: expect.any(Number),
      firstName: 'Tomáš',
      surname: 'Kovář',
      surnameSuffix: 'jr.',
      nationality: 'CZ',
      sex: 'male',
    });
  });

  it('leaves out a missing surname prefix and suffix', async () => {
    const players = await fetchPlayers();
    const jana = players.find(
      (p) => p.firstName === 'Jana' && p.surname === 'Nováková',
    );

    expect(jana).toBeDefined();
    expect(jana).not.toHaveProperty('surnamePrefix');
    expect(jana).not.toHaveProperty('surnameSuffix');
  });

  it('throws the Supabase error when the request fails', async () => {
    // PostgREST answers a request for a schema it doesn't expose with an
    // error, which supabase-js returns instead of data.
    const misconfiguredClient = createClient<Database>(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      { db: { schema: 'not_exposed' as 'public' } },
    );

    await expect(fetchPlayers(misconfiguredClient)).rejects.toMatchObject({
      code: 'PGRST106',
    });
  });
});
