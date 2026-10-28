import type { Database } from '@/repositories/database.types';

// The columns the players repository selects.
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
