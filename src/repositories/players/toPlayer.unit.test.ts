import { describe, expect, it } from 'vitest';

import type { PlayerRow } from './playerRow';
import { buildPlayerRow } from './playerRowMocks';
import { toPlayer } from './toPlayer';

describe('toPlayer', () => {
  it('maps every field of a row', () => {
    const row = buildPlayerRow({
      id: 7,
      first_name: 'Pieter',
      surname_prefix: 'de',
      surname: 'Vries',
      surname_suffix: 'jr.',
      nationality: 'NL',
      sex: 'male',
    });

    expect(toPlayer(row)).toEqual({
      id: 7,
      firstName: 'Pieter',
      surnamePrefix: 'de',
      surname: 'Vries',
      surnameSuffix: 'jr.',
      nationality: 'NL',
      sex: 'male',
    });
  });

  it('leaves out a null surname prefix and suffix', () => {
    const player = toPlayer(
      buildPlayerRow({ surname_prefix: null, surname_suffix: null }),
    );

    expect(player).not.toHaveProperty('surnamePrefix');
    expect(player).not.toHaveProperty('surnameSuffix');
  });

  it('rejects an unknown nationality', () => {
    expect(() => toPlayer(buildPlayerRow({ nationality: 'FR' }))).toThrow();
  });

  it('rejects an unknown sex', () => {
    // A database row can't hold another sex; this guards against drift.
    expect(() =>
      toPlayer(buildPlayerRow({ sex: 'other' as PlayerRow['sex'] })),
    ).toThrow();
  });

  it('rejects an empty surname', () => {
    expect(() => toPlayer(buildPlayerRow({ surname: '' }))).toThrow();
  });
});
