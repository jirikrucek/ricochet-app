import { describe, expect, it } from 'vitest';

import { playerOverviewSearchDefaults } from '@/modules/players/domain/types/playerOverviewSearch';
import { isSameViewIgnoringPage } from './isSameViewIgnoringPage';

describe('isSameViewIgnoringPage', () => {
  const base = { ...playerOverviewSearchDefaults };

  it('ignores a different page', () => {
    expect(isSameViewIgnoringPage(base, { ...base, page: 3 })).toBe(true);
  });

  it.each([
    { sort: 'desc' },
    { nationality: 'CZ' },
    { sex: 'female' },
  ] as const)('sees %j as a different view', (change) => {
    expect(isSameViewIgnoringPage(base, { ...base, ...change })).toBe(false);
  });
});
