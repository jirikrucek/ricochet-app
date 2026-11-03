import { describe, expect, it } from 'vitest';

import { fetchPlayerNationalities } from './fetchPlayerNationalities';

describe('fetchPlayerNationalities', () => {
  it('returns each nationality some seeded player has, once', async () => {
    const nationalities = await fetchPlayerNationalities();

    expect([...nationalities].sort()).toEqual([
      'CZ',
      'DE',
      'GB',
      'HU',
      'NL',
      'PL',
    ]);
  });
});
