import type { SupabaseClient } from '@supabase/supabase-js';

import type { Player } from '../../domain/players/player';
import type { Database } from '../database.types';
import { supabase } from '../supabaseClient';
import { playerColumns } from './playerRow';
import { toPlayer } from './toPlayer';

// Fetches every player at once; filtering, sorting (language-aware), and
// paging happen in the domain. PostgREST caps a response at `max_rows` (1000,
// supabase/config.toml), so past a few hundred players switch to server-side
// paging rather than raising the cap.
export async function fetchPlayers(
  client: SupabaseClient<Database> = supabase,
): Promise<Player[]> {
  const { data, error } = await client.from('players').select(playerColumns);

  if (error) {
    throw error;
  }

  return data.map(toPlayer);
}
