import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { matchesFilter, orAll } from './filter';

describe('matchesFilter', () => {
  it('matches every value for "all"', () => {
    expect(matchesFilter('all', 'CZ')).toBe(true);
  });

  it('matches only the selected value otherwise', () => {
    expect(matchesFilter('CZ', 'CZ')).toBe(true);
    expect(matchesFilter('CZ', 'DE')).toBe(false);
  });
});

describe('orAll', () => {
  const schema = orAll(z.enum(['CZ', 'DE']));

  it('accepts the schema values and "all"', () => {
    expect(schema.parse('CZ')).toBe('CZ');
    expect(schema.parse('all')).toBe('all');
  });

  it('rejects anything else', () => {
    expect(schema.safeParse('PL').success).toBe(false);
  });
});
