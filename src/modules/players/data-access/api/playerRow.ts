import type { Database } from '@/db/database.types';

// The columns fetchPlayers selects.
export const playerColumns =
  'id, first_name, surname_prefix, surname, surname_suffix, nationality, sex';

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
