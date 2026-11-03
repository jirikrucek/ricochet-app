import { createClient } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';

import { itemsPerPage } from '@/config/pagination';
import type { Database } from '@/db/supabase.types';
import { formatSurname } from '@/modules/players/domain/utils/formatSurname';
import type { Player } from '@/modules/players/domain/types/player';
import {
  playerOverviewSearchDefaults,
  type PlayerOverviewView,
} from '@/modules/players/domain/types/playerOverviewSearch';
import { fetchPlayersPage } from './fetchPlayersPage';

function view(overrides: Partial<PlayerOverviewView> = {}): PlayerOverviewView {
  return { ...playerOverviewSearchDefaults, ...overrides };
}

// Every player of a view, in display order, walking the pages like a visitor.
async function allPages(
  overrides: Partial<PlayerOverviewView> = {},
  language = 'en',
) {
  const players: Player[] = [];
  const first = await fetchPlayersPage(view(overrides), language);
  players.push(...first.rows);
  for (let page = 2; page <= first.pageCount; page++) {
    const next = await fetchPlayersPage(view({ ...overrides, page }), language);
    players.push(...next.rows);
  }
  return players;
}

function positionOf(players: Player[], name: string) {
  const index = players.findIndex(
    (p) => `${p.firstName} ${formatSurname(p)}` === name,
  );
  expect(index, `${name} should be listed`).toBeGreaterThanOrEqual(0);
  return index;
}

function expectInOrder(players: Player[], names: string[]) {
  const positions = names.map((name) => positionOf(players, name));
  expect(positions).toEqual([...positions].sort((a, b) => a - b));
}

describe('fetchPlayersPage paging', () => {
  it('returns one page with the total and the page count', async () => {
    const result = await fetchPlayersPage(view(), 'en');

    expect(result.rows).toHaveLength(itemsPerPage);
    expect(result).toMatchObject({ total: 100, page: 1, pageCount: 4 });
  });

  it('returns the remaining players on the last page', async () => {
    const result = await fetchPlayersPage(
      view({ sex: 'female', page: 2 }),
      'en',
    );

    expect(result.rows).toHaveLength(15);
    expect(result).toMatchObject({ total: 40, page: 2, pageCount: 2 });
  });

  it('lists every player exactly once across the pages', async () => {
    const players = await allPages();

    expect(new Set(players.map((p) => p.id)).size).toBe(100);
    expect(players).toHaveLength(100);
  });

  it.each([5, 9, 1000])(
    'falls back to page 1 for page %i, beyond the last',
    async (page) => {
      const result = await fetchPlayersPage(view({ page }), 'en');

      expect(result).toMatchObject({ total: 100, page: 1, pageCount: 4 });
      expect(result.rows).toEqual((await fetchPlayersPage(view(), 'en')).rows);
    },
  );
});

describe('fetchPlayersPage filters', () => {
  it('returns only players of a nationality', async () => {
    const result = await fetchPlayersPage(view({ nationality: 'HU' }), 'en');

    expect(result.total).toBe(4);
    expect(new Set(result.rows.map((p) => p.nationality))).toEqual(
      new Set(['HU']),
    );
  });

  it('returns only players of a sex', async () => {
    const result = await fetchPlayersPage(view({ sex: 'female' }), 'en');

    expect(result.total).toBe(40);
    expect(new Set(result.rows.map((p) => p.sex))).toEqual(new Set(['female']));
  });

  it('combines both filters', async () => {
    const result = await fetchPlayersPage(
      view({ nationality: 'PL', sex: 'male' }),
      'en',
    );

    expect(result.total).toBeGreaterThan(0);
    expect(
      result.rows.every((p) => p.nationality === 'PL' && p.sex === 'male'),
    ).toBe(true);
  });

  it('answers a view that matches nobody with an empty first page', async () => {
    const result = await fetchPlayersPage(
      view({ nationality: 'GB', sex: 'female' }),
      'en',
    );

    expect(result).toEqual({ rows: [], total: 0, page: 1, pageCount: 1 });
  });

  it('falls back to page 1 of a view that matches nobody', async () => {
    const result = await fetchPlayersPage(
      view({ nationality: 'GB', sex: 'female', page: 3 }),
      'en',
    );

    expect(result).toEqual({ rows: [], total: 0, page: 1, pageCount: 1 });
  });

  it('keeps the sort order within a filter', async () => {
    const czech = await allPages({ nationality: 'CZ' });

    expectInOrder(czech, ['Tomáš Kovář', 'Tomáš Kovář jr.', 'Tomáš Kovář sr.']);
  });
});

describe('fetchPlayersPage sorting', () => {
  it('sorts ascending by surname by default', async () => {
    const players = await allPages();
    const surnames = players.map((p) => p.surname);

    expect(surnames.indexOf('Bakker')).toBeLessThan(surnames.indexOf('Nagy'));
    expect(surnames.indexOf('Nagy')).toBeLessThan(surnames.indexOf('Wagner'));
  });

  it('ignores the surname prefix', async () => {
    expectInOrder(await allPages(), [
      'Anna Bakker',
      'Jan Novák',
      'Pieter de Vries',
    ]);
  });

  it('ignores letter case', async () => {
    const surnames = (await allPages()).map((p) => p.surname);

    expect(surnames.indexOf('Macbeth')).toBeLessThan(
      surnames.indexOf('MacDonald'),
    );
  });

  it('follows the collation of the UI language', async () => {
    const inCzech = (await allPages({}, 'cs')).map((p) => p.surname);
    const inEnglish = (await allPages({}, 'en')).map((p) => p.surname);

    expect(inCzech.indexOf('Horák')).toBeLessThan(inCzech.indexOf('Chládek'));
    expect(inEnglish.indexOf('Chládek')).toBeLessThan(
      inEnglish.indexOf('Horák'),
    );
  });

  it.each(['cs', 'de', 'en', 'hu', 'nl', 'pl'])(
    'answers in %s with every player',
    async (language) => {
      expect(await allPages({}, language)).toHaveLength(100);
    },
  );

  it('falls back to English for an unsupported language', async () => {
    expect(await allPages({}, "x'; drop table players; --")).toEqual(
      await allPages({}, 'en'),
    );
  });

  it('orders a shared surname by first name', async () => {
    expectInOrder(await allPages(), ['Anna Szabó', 'Petra Szabó']);
  });

  it('orders the same name by suffix, with no suffix first', async () => {
    expectInOrder(await allPages(), [
      'Tomáš Kovář',
      'Tomáš Kovář jr.',
      'Tomáš Kovář sr.',
    ]);
  });

  it('reverses every key when descending', async () => {
    expectInOrder(await allPages({ sort: 'desc' }), [
      'Pieter de Vries',
      'Tomáš Kovář sr.',
      'Tomáš Kovář jr.',
      'Tomáš Kovář',
      'Anna Bakker',
    ]);
  });
});

describe('fetchPlayersPage mapping and failures', () => {
  it('maps the rows to domain players', async () => {
    const { rows } = await fetchPlayersPage(view({ nationality: 'NL' }), 'en');

    expect(rows).toContainEqual({
      id: expect.any(Number),
      firstName: 'Pieter',
      surnamePrefix: 'de',
      surname: 'Vries',
      nationality: 'NL',
      sex: 'male',
    });
    const anyWithoutPrefix = rows.find((p) => p.surnamePrefix === undefined);
    expect(anyWithoutPrefix).not.toHaveProperty('surnamePrefix');
    expect(anyWithoutPrefix).not.toHaveProperty('surnameSuffix');
  });

  it('throws the Supabase error when the request fails', async () => {
    // PostgREST answers a request for a schema it doesn't expose with an
    // error, which supabase-js returns instead of data.
    const misconfiguredClient = createClient<Database>(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      { db: { schema: 'not_exposed' as 'public' } },
    );

    await expect(
      fetchPlayersPage(view(), 'en', misconfiguredClient),
    ).rejects.toMatchObject({ code: 'PGRST106' });
  });
});
