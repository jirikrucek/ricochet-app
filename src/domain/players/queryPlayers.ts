import type { Player } from './player';
import type { PlayerOverviewView } from './playerOverviewSearch';

export type PlayerOverviewResult = {
  rows: Player[];
};

// Case-insensitive but accent-aware, in the collation of the UI language
// (Czech sorts "Ch" after "H"). Keys: surname without its prefix, then first
// name, then suffix with no suffix first. Descending reverses every key.
function playerComparator(locale: string, direction: 'asc' | 'desc') {
  const collator = new Intl.Collator(locale, { sensitivity: 'accent' });
  const sign = direction === 'desc' ? -1 : 1;

  return (a: Player, b: Player) =>
    sign *
    (collator.compare(a.surname, b.surname) ||
      collator.compare(a.firstName, b.firstName) ||
      Number(a.surnameSuffix !== undefined) -
        Number(b.surnameSuffix !== undefined) ||
      collator.compare(a.surnameSuffix ?? '', b.surnameSuffix ?? ''));
}

export function queryPlayers(
  players: readonly Player[],
  view: PlayerOverviewView,
  locale: string,
): PlayerOverviewResult {
  const rows = [...players].sort(playerComparator(locale, view.sort));
  return { rows };
}
