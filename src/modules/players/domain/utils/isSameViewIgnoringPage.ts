import type { PlayerOverviewView } from '@/modules/players/domain/types/playerOverviewSearch';

// True when the two views differ at most in `page`. A change in any other
// field (sort, a filter) is a different view that restarts at
// page 1. Comparing every other key means a new field is covered by default.
export function isSameViewIgnoringPage(
  a: PlayerOverviewView,
  b: PlayerOverviewView,
): boolean {
  return (Object.keys(a) as (keyof PlayerOverviewView)[])
    .filter((key) => key !== 'page')
    .every((key) => a[key] === b[key]);
}
