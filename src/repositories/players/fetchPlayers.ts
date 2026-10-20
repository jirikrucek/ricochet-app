import type { SupabaseClient } from '@supabase/supabase-js';

import type { Player } from '../../domain/players/player';
import type { Database } from '../database.types';
import { supabase } from '../supabaseClient';
import { playerColumns } from './playerRow';
import { toPlayer } from './toPlayer';

// PostgREST's `max_rows` (supabase/config.toml). It cuts a longer response
// off without an error.
export const maxRows = 1000;

// Fetches every player at once; filtering, sorting (language-aware), and
// paging happen in the domain. A response of `maxRows` may be cut off, which
// would leave the overview, its page count, and its filter options silently
// wrong, so that fails loudly instead. Before then, switch to server-side
// paging rather than raising the cap.
export async function fetchPlayers(
  client: SupabaseClient<Database> = supabase,
): Promise<Player[]> {
  // The order keeps the rows in the same sequence on every refetch.
  const { data, error } = await client
    .from('players')
    .select(playerColumns)
    .order('id');

  if (error) {
    throw error;
  }

  if (data.length >= maxRows) {
    throw new Error(
      `players_fetch_possibly_truncated: ${data.length} rows reached the ${maxRows}-row response cap`,
    );
  }

  return data.map(toPlayer);
}
