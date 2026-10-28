import { describe, expect, it } from 'vitest';

import type { Player } from './player';
import { formatSurname } from './player';
import { buildPlayer } from './playerMocks';
import {
  playerOverviewSearchDefaults,
  type PlayerOverviewView,
} from './playerOverviewSearch';
import {
  nationalityFilterEntries,
  presentNationalities,
  queryPlayers,
} from './queryPlayers';

function buildView(
  overrides: Partial<PlayerOverviewView> = {},
): PlayerOverviewView {
  return { ...playerOverviewSearchDefaults, ...overrides };
}

function names(players: Player[]) {
  return players.map((p) => `${p.firstName} ${formatSurname(p)}`);
}

function surnames(players: Player[]) {
  return players.map(formatSurname);
}

describe('queryPlayers sorting', () => {
  it('sorts ascending by surname by default', () => {
    const players = ['Wagner', 'Bakker', 'Nagy'].map((surname) =>
      buildPlayer({ surname }),
    );

    expect(surnames(queryPlayers(players, buildView(), 'en').rows)).toEqual([
      'Bakker',
      'Nagy',
      'Wagner',
    ]);
  });

  it('ignores the surname prefix', () => {
    const players = [
      buildPlayer({
        firstName: 'Pieter',
        surnamePrefix: 'de',
        surname: 'Vries',
      }),
      buildPlayer({ firstName: 'Jan', surname: 'Novák' }),
      buildPlayer({ firstName: 'Anna', surname: 'Bakker' }),
    ];

    expect(surnames(queryPlayers(players, buildView(), 'en').rows)).toEqual([
      'Bakker',
      'Novák',
      'de Vries',
    ]);
  });

  it('ignores letter case', () => {
    const players = ['MacDonald', 'Macbeth'].map((surname) =>
      buildPlayer({ surname }),
    );

    expect(surnames(queryPlayers(players, buildView(), 'en').rows)).toEqual([
      'Macbeth',
      'MacDonald',
    ]);
  });

  it('follows the collation of the locale', () => {
    const players = ['Chládek', 'Horák'].map((surname) =>
      buildPlayer({ surname }),
    );

    expect(surnames(queryPlayers(players, buildView(), 'cs').rows)).toEqual([
      'Horák',
      'Chládek',
    ]);
    expect(surnames(queryPlayers(players, buildView(), 'en').rows)).toEqual([
      'Chládek',
      'Horák',
    ]);
  });

  it('breaks a shared surname by first name', () => {
    const players = [
      buildPlayer({ firstName: 'Petra', surname: 'Szabó' }),
      buildPlayer({ firstName: 'Anna', surname: 'Szabó' }),
    ];

    expect(names(queryPlayers(players, buildView(), 'hu').rows)).toEqual([
      'Anna Szabó',
      'Petra Szabó',
    ]);
  });

  it('breaks the same name by surname suffix, with no suffix first', () => {
    const players = [
      buildPlayer({
        firstName: 'Tomáš',
        surname: 'Kovář',
        surnameSuffix: 'sr.',
      }),
      buildPlayer({
        firstName: 'Tomáš',
        surname: 'Kovář',
        surnameSuffix: 'jr.',
      }),
      buildPlayer({ firstName: 'Tomáš', surname: 'Kovář' }),
    ];

    expect(surnames(queryPlayers(players, buildView(), 'cs').rows)).toEqual([
      'Kovář',
      'Kovář jr.',
      'Kovář sr.',
    ]);
  });

  it('reverses every key when descending', () => {
    const players = [
      buildPlayer({ firstName: 'Anna', surname: 'Bakker' }),
      buildPlayer({ firstName: 'Tomáš', surname: 'Kovář' }),
      buildPlayer({
        firstName: 'Tomáš',
        surname: 'Kovář',
        surnameSuffix: 'jr.',
      }),
      buildPlayer({
        firstName: 'Pieter',
        surnamePrefix: 'de',
        surname: 'Vries',
      }),
      buildPlayer({ firstName: 'Anna', surname: 'Szabó' }),
      buildPlayer({ firstName: 'Petra', surname: 'Szabó' }),
    ];

    expect(
      names(queryPlayers(players, buildView({ sort: 'desc' }), 'en').rows),
    ).toEqual([
      'Pieter de Vries',
      'Petra Szabó',
      'Anna Szabó',
      'Tomáš Kovář jr.',
      'Tomáš Kovář',
      'Anna Bakker',
    ]);
  });

  it('does not reorder the players it was given', () => {
    const players = ['Wagner', 'Bakker'].map((surname) =>
      buildPlayer({ surname }),
    );

    queryPlayers(players, buildView(), 'en');

    expect(surnames(players)).toEqual(['Wagner', 'Bakker']);
  });
});

describe('queryPlayers nationality filter', () => {
  const players = [
    buildPlayer({ surname: 'Novák', nationality: 'CZ' }),
    buildPlayer({ surname: 'Wagner', nationality: 'DE' }),
    buildPlayer({ surname: 'Nowak', nationality: 'PL' }),
    buildPlayer({ surname: 'Schmidt', nationality: 'DE' }),
  ];

  it("lets every player through with 'all'", () => {
    expect(
      queryPlayers(players, buildView({ nationality: 'all' }), 'en').rows,
    ).toHaveLength(4);
  });

  it('keeps only players of the chosen nationality', () => {
    const { rows } = queryPlayers(
      players,
      buildView({ nationality: 'DE' }),
      'en',
    );

    expect(surnames(rows)).toEqual(['Schmidt', 'Wagner']);
  });

  it('returns no rows when no player has the nationality', () => {
    expect(
      queryPlayers(players, buildView({ nationality: 'GB' }), 'en').rows,
    ).toEqual([]);
  });
});

describe('presentNationalities', () => {
  it('returns each nationality present among the players once', () => {
    const players = [
      buildPlayer({ nationality: 'NL' }),
      buildPlayer({ nationality: 'CZ' }),
      buildPlayer({ nationality: 'NL' }),
    ];

    const present = presentNationalities(players);

    expect(present).toHaveLength(2);
    expect(new Set(present)).toEqual(new Set(['CZ', 'NL']));
  });

  it('returns nothing for no players', () => {
    expect(presentNationalities([])).toEqual([]);
  });
});

describe('queryPlayers sex filter', () => {
  const players = [
    buildPlayer({ surname: 'Nováková', nationality: 'CZ', sex: 'female' }),
    buildPlayer({ surname: 'Novák', nationality: 'CZ', sex: 'male' }),
    buildPlayer({ surname: 'Nowak', nationality: 'PL', sex: 'male' }),
    buildPlayer({ surname: 'Kowalska', nationality: 'PL', sex: 'female' }),
  ];

  it("lets both sexes through with 'all'", () => {
    expect(
      queryPlayers(players, buildView({ sex: 'all' }), 'en').rows,
    ).toHaveLength(4);
  });

  it('keeps only players of the chosen sex', () => {
    const { rows } = queryPlayers(players, buildView({ sex: 'female' }), 'en');

    expect(surnames(rows)).toEqual(['Kowalska', 'Nováková']);
  });

  it('combines the sex and nationality filters with AND', () => {
    const { rows } = queryPlayers(
      players,
      buildView({ nationality: 'PL', sex: 'male' }),
      'en',
    );

    expect(surnames(rows)).toEqual(['Nowak']);
  });
});

describe('queryPlayers page slicing', () => {
  // Surnames P01…P30 sort in creation order.
  const players = Array.from({ length: 30 }, (_, index) =>
    buildPlayer({
      surname: `P${String(index + 1).padStart(2, '0')}`,
      sex: index < 12 ? 'female' : 'male',
    }),
  );

  it('returns the requested page with the total and page count', () => {
    const result = queryPlayers(
      players,
      buildView({ page: 2, pageSize: 10 }),
      'en',
    );

    expect(surnames(result.rows)).toEqual(
      Array.from({ length: 10 }, (_, i) => `P${11 + i}`),
    );
    expect(result).toMatchObject({ total: 30, page: 2, pageCount: 3 });
  });

  it('returns the remaining players on the last page', () => {
    const result = queryPlayers(
      players,
      buildView({ page: 2, pageSize: 25 }),
      'en',
    );

    expect(result.rows).toHaveLength(5);
    expect(result).toMatchObject({ total: 30, page: 2, pageCount: 2 });
  });

  it('counts and pages only the filtered players', () => {
    const result = queryPlayers(
      players,
      buildView({ sex: 'female', pageSize: 10, page: 2 }),
      'en',
    );

    expect(result.rows).toHaveLength(2);
    expect(result).toMatchObject({ total: 12, page: 2, pageCount: 2 });
  });

  it('falls back to page 1 for a page beyond the last', () => {
    const result = queryPlayers(
      players,
      buildView({ page: 9, pageSize: 10 }),
      'en',
    );

    expect(result.page).toBe(1);
    expect(surnames(result.rows)[0]).toBe('P01');
  });

  it('has one page and no rows when nothing matches', () => {
    expect(
      queryPlayers(players, buildView({ nationality: 'GB' }), 'en'),
    ).toEqual({
      rows: [],
      total: 0,
      page: 1,
      pageCount: 1,
    });
  });
});

describe('nationalityFilterEntries', () => {
  const players = ['NL', 'CZ', 'DE', 'NL'].map((nationality) =>
    buildPlayer({ nationality: nationality as Player['nationality'] }),
  );

  it('names each present nationality once, ordered by name', () => {
    const names = { CZ: 'Czechia', DE: 'Germany', NL: 'Netherlands' };

    const entries = nationalityFilterEntries(
      players,
      (nationality) => names[nationality as keyof typeof names],
      'en',
    );

    expect(entries).toEqual([
      { nationality: 'CZ', name: 'Czechia' },
      { nationality: 'DE', name: 'Germany' },
      { nationality: 'NL', name: 'Netherlands' },
    ]);
  });

  it("orders by the locale's collation, not by code point", () => {
    // Czech sorts "Ch" after "H"; code point order would put it first.
    const names = { CZ: 'Chorvatsko', DE: 'Hongkong', NL: 'Andorra' };

    const entries = nationalityFilterEntries(
      players,
      (nationality) => names[nationality as keyof typeof names],
      'cs',
    );

    expect(entries.map(({ name }) => name)).toEqual([
      'Andorra',
      'Hongkong',
      'Chorvatsko',
    ]);
  });
});
