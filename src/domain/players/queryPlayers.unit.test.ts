import { describe, expect, it } from 'vitest';

import type { Player } from './player';
import { formatSurname } from './player';
import { buildPlayer } from './playerMocks';
import {
  playerOverviewSearchDefaults,
  type PlayerOverviewView,
} from './playerOverviewSearch';
import { queryPlayers } from './queryPlayers';

function view(overrides: Partial<PlayerOverviewView> = {}): PlayerOverviewView {
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

    expect(surnames(queryPlayers(players, view(), 'en').rows)).toEqual([
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

    expect(surnames(queryPlayers(players, view(), 'en').rows)).toEqual([
      'Bakker',
      'Novák',
      'de Vries',
    ]);
  });

  it('ignores letter case', () => {
    const players = ['MacDonald', 'Macbeth'].map((surname) =>
      buildPlayer({ surname }),
    );

    expect(surnames(queryPlayers(players, view(), 'en').rows)).toEqual([
      'Macbeth',
      'MacDonald',
    ]);
  });

  it('follows the collation of the locale', () => {
    const players = ['Chládek', 'Horák'].map((surname) =>
      buildPlayer({ surname }),
    );

    expect(surnames(queryPlayers(players, view(), 'cs').rows)).toEqual([
      'Horák',
      'Chládek',
    ]);
    expect(surnames(queryPlayers(players, view(), 'en').rows)).toEqual([
      'Chládek',
      'Horák',
    ]);
  });

  it('breaks a shared surname by first name', () => {
    const players = [
      buildPlayer({ firstName: 'Petra', surname: 'Szabó' }),
      buildPlayer({ firstName: 'Anna', surname: 'Szabó' }),
    ];

    expect(names(queryPlayers(players, view(), 'hu').rows)).toEqual([
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

    expect(surnames(queryPlayers(players, view(), 'cs').rows)).toEqual([
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
      names(queryPlayers(players, view({ sort: 'desc' }), 'en').rows),
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

    queryPlayers(players, view(), 'en');

    expect(surnames(players)).toEqual(['Wagner', 'Bakker']);
  });
});
