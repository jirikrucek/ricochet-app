import type { SupabaseClient } from '@supabase/supabase-js';

import {
  nationalitySchema,
  type Nationality,
} from '@/modules/players/domain/types/player';
import type { Database } from '@/db/supabase.types';
import { supabase } from '@/db/supabaseClient';

// The nationalities some player has. Empty means no players exist, because every
// player has a nationality.
export async function fetchPlayerNationalities(
  client: SupabaseClient<Database> = supabase,
): Promise<Nationality[]> {
  const { data, error } = await client
    .from('player_nationalities')
    .select('nationality');

  if (error) {
    throw error;
  }

  return data.map((row) => nationalitySchema.parse(row.nationality));
}
