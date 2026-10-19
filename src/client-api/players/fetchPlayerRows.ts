import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../database.types';
import { supabase } from '../supabaseClient';

export type PlayerRow = Pick<
  Database['public']['Tables']['players']['Row'],
  | 'id'
  | 'first_name'
  | 'surname_prefix'
  | 'surname'
  | 'surname_suffix'
  | 'nationality'
  | 'sex'
>;

// Fetches every player at once; filtering, sorting (language-aware), and
// paging happen in the domain. PostgREST caps a response at `max_rows` (1000,
// supabase/config.toml), so past a few hundred players switch to server-side
// paging rather than raising the cap.
export async function fetchPlayerRows(
  client: SupabaseClient<Database> = supabase,
): Promise<PlayerRow[]> {
  const { data, error } = await client
    .from('players')
    .select(
      'id, first_name, surname_prefix, surname, surname_suffix, nationality, sex',
    );

  if (error) {
    throw error;
  }

  return data;
}
