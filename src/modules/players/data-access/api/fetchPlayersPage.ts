import type { SupabaseClient } from '@supabase/supabase-js';

import { itemsPerPage } from '@/config/pagination';
import type { PlayerOverviewPage } from '@/modules/players/domain/types/playerOverviewPage';
import {
  all,
  type PlayerOverviewView,
} from '@/modules/players/domain/types/playerOverviewSearch';
import type { Database } from '@/db/supabase.types';
import { supabase } from '@/db/supabaseClient';
import { playerColumns } from './playerRow';
import { toPlayer } from './toPlayer';

// PostgREST's answer to an offset beyond the total.
const rangeNotSatisfiable = 'PGRST103';

// One page of the view, in the order of the UI language (ADR 0020). The backend
// filters, sorts and pages; the total comes from the response's Content-Range.
export async function fetchPlayersPage(
  view: PlayerOverviewView,
  language: string,
  client: SupabaseClient<Database> = supabase,
): Promise<PlayerOverviewPage> {
  const from = (view.page - 1) * itemsPerPage;

  let query = client
    .rpc(
      'players_sorted',
      { ui_language: language },
      { count: 'exact', get: true },
    )
    .select(playerColumns);
  if (view.nationality !== all) {
    query = query.eq('nationality', view.nationality);
  }
  if (view.sex !== all) {
    query = query.eq('sex', view.sex);
  }

  const { data, count, error } = await query
    .order('sort_position', { ascending: view.sort === 'asc' })
    .range(from, from + itemsPerPage - 1);

  // A page beyond the last only shows up here, once the total is known. An offset
  // past the total is an error, but one exactly at the total is an empty answer.
  if (
    view.page > 1 &&
    (error?.code === rangeNotSatisfiable || data?.length === 0)
  ) {
    return fetchPlayersPage({ ...view, page: 1 }, language, client);
  }

  if (error) {
    throw error;
  }

  if (count === null) {
    throw new Error('players_page_missing_count: the response had no total');
  }

  return {
    rows: data.map(toPlayer),
    total: count,
    page: view.page,
    pageCount: Math.max(1, Math.ceil(count / itemsPerPage)),
  };
}
