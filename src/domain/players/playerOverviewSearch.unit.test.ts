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
