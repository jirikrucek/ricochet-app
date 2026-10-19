import { createClient } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';

import type { Database } from '../database.types';
import { fetchPlayerRows } from './fetchPlayerRows';

describe('fetchPlayerRows', () => {
  it('returns every seeded player with only the explicit columns', async () => {
    const rows = await fetchPlayerRows();

    expect(rows).toHaveLength(100);
    expect(Object.keys(rows[0]).sort()).toEqual(
      [
        'first_name',
        'id',
        'nationality',
        'sex',
        'surname',
        'surname_prefix',
        'surname_suffix',
      ].sort(),
    );
  });

  it('throws the Supabase error when the request fails', async () => {
    // PostgREST answers a request for a schema it doesn't expose with an
    // error, which supabase-js returns instead of data.
    const misconfiguredClient = createClient<Database>(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      { db: { schema: 'not_exposed' as 'public' } },
    );

    await expect(fetchPlayerRows(misconfiguredClient)).rejects.toMatchObject({
      code: 'PGRST106',
    });
  });
});
