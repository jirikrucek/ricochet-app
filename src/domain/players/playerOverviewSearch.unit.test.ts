import { describe, expect, it } from 'vitest';

import { playerOverviewSearchSchema } from './playerOverviewSearch';

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
