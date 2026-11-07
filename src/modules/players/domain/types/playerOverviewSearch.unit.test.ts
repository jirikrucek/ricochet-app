import { describe, expect, it } from 'vitest';

import {
  playerFiltersSchema,
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

describe('playerOverviewSearchSchema unknown params', () => {
  it('drops a leftover pageSize from an old shared link', () => {
    expect(parse({ pageSize: 50 })).not.toHaveProperty('pageSize');
  });
});

describe('playerFiltersSchema', () => {
  it('keeps a valid nationality and sex', () => {
    expect(
      playerFiltersSchema.parse({ nationality: 'PL', sex: 'male' }),
    ).toEqual({ nationality: 'PL', sex: 'male' });
  });

  it("defaults both filters to 'all'", () => {
    expect(playerFiltersSchema.parse({})).toEqual({
      nationality: 'all',
      sex: 'all',
    });
  });

  it("falls back to 'all' for a value that is not a nationality or a sex", () => {
    expect(
      playerFiltersSchema.parse({ nationality: 'FR', sex: 'other' }),
    ).toEqual({ nationality: 'all', sex: 'all' });
  });

  it('leaves out the sort direction and the page, which are not filters', () => {
    const parsed = playerFiltersSchema.parse({ sort: 'desc', page: 3 });

    expect(parsed).not.toHaveProperty('sort');
    expect(parsed).not.toHaveProperty('page');
  });
});
