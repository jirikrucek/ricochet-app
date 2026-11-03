import type { Database } from '@/db/supabase.types';

// The columns fetchPlayersPage selects. PostgREST narrows a function call to the
// selected columns, so sort_position must be here for the query to order by it.
export const playerColumns =
  'id, first_name, surname_prefix, surname, surname_suffix, nationality, sex, sort_position';

// The generated types mark every field of a composite type nullable, which isn't
// what players_sorted returns. toPlayer validates the row, so a real null would
// fail there instead of reaching the app.
export type PlayerRow = Omit<
  Database['public']['CompositeTypes']['player_sorted'],
  'sort_position'
>;
