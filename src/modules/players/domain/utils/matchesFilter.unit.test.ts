import { describe, expect, it } from 'vitest';

import { matchesFilter } from './matchesFilter';

describe('matchesFilter', () => {
  it('matches every value for "all"', () => {
    expect(matchesFilter('all', 'CZ')).toBe(true);
  });

  it('matches only the selected value otherwise', () => {
    expect(matchesFilter('CZ', 'CZ')).toBe(true);
    expect(matchesFilter('CZ', 'DE')).toBe(false);
  });
});
