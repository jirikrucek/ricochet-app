import { describe, expect, it } from 'vitest';

import { supabase } from '../supabaseClient';

// E2E expectations (counts, sort orders, page numbers) depend on these facts
// about supabase/seed.sql, so an edit to the seed fails here first.

async function countPlayers(
  filter: { nationality?: string; sex?: 'male' | 'female' } = {},
) {
  let query = supabase
    .from('players')
    .select('id', { count: 'exact', head: true });
  if (filter.nationality) query = query.eq('nationality', filter.nationality);
  if (filter.sex) query = query.eq('sex', filter.sex);
  const { count, error } = await query;
  if (error) throw error;
  return count;
}

async function allPlayers() {
  const { data, error } = await supabase
    .from('players')
    .select(
      'first_name, surname_prefix, surname, surname_suffix, nationality, sex',
    );
  if (error) throw error;
  return data;
}

describe('seed data', () => {
  it('holds exactly 100 players', async () => {
    expect(await countPlayers()).toBe(100);
  });

  it('holds 40 female players', async () => {
    expect(await countPlayers({ sex: 'female' })).toBe(40);
  });

  it('holds 24 Czech and 4 Hungarian players', async () => {
    expect(await countPlayers({ nationality: 'CZ' })).toBe(24);
    expect(await countPlayers({ nationality: 'HU' })).toBe(4);
  });

  it('holds no female British player', async () => {
    expect(await countPlayers({ nationality: 'GB', sex: 'female' })).toBe(0);
  });

  it('covers all six nationalities and both sexes', async () => {
    const players = await allPlayers();

    expect(new Set(players.map((p) => p.nationality))).toEqual(
      new Set(['CZ', 'DE', 'HU', 'PL', 'NL', 'GB']),
    );
    expect(new Set(players.map((p) => p.sex))).toEqual(
      new Set(['male', 'female']),
    );
  });

  it('holds male and female players of Poland and Czechia', async () => {
    for (const nationality of ['PL', 'CZ']) {
      expect(await countPlayers({ nationality, sex: 'male' })).toBeGreaterThan(
        0,
      );
      expect(
        await countPlayers({ nationality, sex: 'female' }),
      ).toBeGreaterThan(0);
    }
  });

  it('holds the players the spec scenarios name', async () => {
    const players = await allPlayers();
    const names = players.map((p) =>
      [p.first_name, p.surname_prefix, p.surname, p.surname_suffix]
        .filter(Boolean)
        .join(' '),
    );

    expect(names).toEqual(
      expect.arrayContaining([
        'Jana Nováková',
        'Pieter de Vries',
        'Anna Bakker',
        'Jan Novák',
        'Tomáš Kovář',
        'Tomáš Kovář jr.',
        'Tomáš Kovář sr.',
        'Petra Szabó',
        'Anna Szabó',
      ]),
    );
    const surnames = players.map((p) => p.surname);
    for (const surname of [
      'Wagner',
      'Nagy',
      'MacDonald',
      'Macbeth',
      'Horák',
      'Chládek',
    ]) {
      expect(surnames).toContain(surname);
    }
  });

  it('gives the named players the nationalities the scenarios expect', async () => {
    const players = await allPlayers();
    const nationalityOf = (firstName: string, surname: string) =>
      players.find((p) => p.first_name === firstName && p.surname === surname)
        ?.nationality;

    expect(nationalityOf('Jana', 'Nováková')).toBe('CZ');
    expect(players.some((p) => p.nationality === 'DE')).toBe(true);
    expect(nationalityOf('Anna', 'Szabó')).toBe('HU');
  });

  it('holds a surname prefix and a jr./sr. pair with the same name', async () => {
    const players = await allPlayers();

    expect(players.some((p) => p.surname_prefix === 'de')).toBe(true);
    const kovars = players.filter(
      (p) => p.first_name === 'Tomáš' && p.surname === 'Kovář',
    );
    const suffixes = kovars.map((p) => p.surname_suffix);
    expect(suffixes).toHaveLength(3);
    expect(suffixes).toEqual(expect.arrayContaining([null, 'jr.', 'sr.']));
  });

  it('holds surnames shared by several players', async () => {
    const players = await allPlayers();
    const counts = new Map<string, number>();
    for (const p of players) {
      counts.set(p.surname, (counts.get(p.surname) ?? 0) + 1);
    }

    expect(counts.get('Szabó')).toBe(2);
    expect(counts.get('Kovář')).toBe(3);
  });
});
