import { nationalities, type Nationality, type Player } from './player';
import { matchesFilter, type PlayerOverviewView } from './playerOverviewSearch';

export type PlayerOverviewResult = {
  // The players on the effective page.
  rows: Player[];
  // Players matching the filters, across all pages.
  total: number;
  // The effective page: 1 when the requested page is beyond the last.
  page: number;
  pageCount: number;
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

// Filter, then sort, then slice: one entry point keeps that order and the
// page fallback in one tested place (ADR 0010).
export function queryPlayers(
  players: readonly Player[],
  view: PlayerOverviewView,
  locale: string,
): PlayerOverviewResult {
  const matching = players
    .filter(
      (player) =>
        matchesFilter(view.nationality, player.nationality) &&
        matchesFilter(view.sex, player.sex),
    )
    .sort(playerComparator(locale, view.sort));

  const total = matching.length;
  const pageCount = Math.max(1, Math.ceil(total / view.pageSize));
  const page = view.page > pageCount ? 1 : view.page;
  const start = (page - 1) * view.pageSize;

  return {
    rows: matching.slice(start, start + view.pageSize),
    total,
    page,
    pageCount,
  };
}

// The nationalities the filter offers: only those some player has.
export function presentNationalities(
  players: readonly Player[],
): Nationality[] {
  const present = new Set(players.map((player) => player.nationality));
  return nationalities.filter((nationality) => present.has(nationality));
}
