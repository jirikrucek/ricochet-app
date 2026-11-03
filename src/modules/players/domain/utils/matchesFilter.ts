import {
  all,
  type OrAll,
} from '@/modules/players/domain/types/playerOverviewSearch';

export function matchesFilter<TValue>(
  filter: OrAll<TValue>,
  value: TValue,
): boolean {
  return filter === all || filter === value;
}
