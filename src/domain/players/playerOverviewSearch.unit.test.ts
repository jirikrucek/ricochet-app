import { describe, expect, it } from 'vitest';

import {
  isSameViewIgnoringPage,
  matchesFilter,
  playerOverviewSearchDefaults,
  playerOverviewSearchSchema,
} from './playerOverviewSearch';

const parse = (search: Record<string, unknown>) =>
  playerOverviewSearchSchema.parse(search);

describe('playerOverviewSearchSchema sort', () => {
  it('defaults to ascending', () => {
    expect(parse({}).sort).toBe('asc');
  });

  it('keeps a valid direction', () => {
    expect(parse({ sort: 'desc' }).sort).toBe('desc');
  });

  it('falls back to ascending for an unknown direction', () => {
    expect(parse({ sort: 'sideways' }).sort).toBe('asc');
  });
});

describe('playerOverviewSearchSchema nationality', () => {
  it("defaults to 'all'", () => {
    expect(parse({}).nationality).toBe('all');
  });

  it('keeps a known nationality code', () => {
    expect(parse({ nationality: 'CZ' }).nationality).toBe('CZ');
  });

  it("falls back to 'all' for an unknown code", () => {
    expect(parse({ nationality: 'FR' }).nationality).toBe('all');
  });

  it('keeps the other params when the nationality is unknown', () => {
    expect(parse({ nationality: 'FR', sort: 'desc' }).sort).toBe('desc');
  });
});

describe('playerOverviewSearchSchema sex', () => {
  it("defaults to 'all'", () => {
    expect(parse({}).sex).toBe('all');
  });

  it('keeps a known sex', () => {
    expect(parse({ sex: 'female' }).sex).toBe('female');
  });

  it("falls back to 'all' for an unknown value", () => {
    expect(parse({ sex: 'unknown' }).sex).toBe('all');
  });
});

describe('playerOverviewSearchSchema page', () => {
  it('defaults to 1', () => {
    expect(parse({}).page).toBe(1);
  });

  it('keeps a positive whole page number', () => {
    expect(parse({ page: 3 }).page).toBe(3);
  });

  it.each(['abc', 0, -2, 1.5])('falls back to 1 for %s', (page) => {
    expect(parse({ page }).page).toBe(1);
  });
});

describe('playerOverviewSearchSchema pageSize', () => {
  it('defaults to 25', () => {
    expect(parse({}).pageSize).toBe(25);
  });

  it.each([10, 25, 50])('keeps %i', (pageSize) => {
    expect(parse({ pageSize }).pageSize).toBe(pageSize);
  });

  it.each([7, 'abc', 100])('falls back to 25 for %s', (pageSize) => {
    expect(parse({ pageSize }).pageSize).toBe(25);
  });
});

describe('matchesFilter', () => {
  it('matches every value for "all"', () => {
    expect(matchesFilter('all', 'CZ')).toBe(true);
  });

  it('matches only the selected value otherwise', () => {
    expect(matchesFilter('CZ', 'CZ')).toBe(true);
    expect(matchesFilter('CZ', 'DE')).toBe(false);
  });
});

describe('isSameViewIgnoringPage', () => {
  const base = { ...playerOverviewSearchDefaults };

  it('ignores a different page', () => {
    expect(isSameViewIgnoringPage(base, { ...base, page: 3 })).toBe(true);
  });

  it.each([
    { sort: 'desc' },
    { nationality: 'CZ' },
    { sex: 'female' },
    { pageSize: 50 },
  ] as const)('sees %j as a different view', (change) => {
    expect(isSameViewIgnoringPage(base, { ...base, ...change })).toBe(false);
  });
});
