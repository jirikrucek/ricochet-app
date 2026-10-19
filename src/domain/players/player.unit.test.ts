import { describe, expect, it } from 'vitest';

import { formatSurname, toPlayer } from './player';
import { buildPlayer, buildPlayerRow } from './playerMocks';

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
    expect(() => toPlayer(buildPlayerRow({ sex: 'other' }))).toThrow();
  });
});

describe('formatSurname', () => {
  it('shows the surname alone when there is no prefix or suffix', () => {
    expect(formatSurname(buildPlayer({ surname: 'Nováková' }))).toBe(
      'Nováková',
    );
  });

  it('puts the prefix before the surname', () => {
    expect(
      formatSurname(buildPlayer({ surnamePrefix: 'de', surname: 'Vries' })),
    ).toBe('de Vries');
  });

  it('puts the suffix after the surname', () => {
    expect(
      formatSurname(buildPlayer({ surname: 'Kovář', surnameSuffix: 'jr.' })),
    ).toBe('Kovář jr.');
  });

  it('shows prefix, surname, and suffix together', () => {
    expect(
      formatSurname(
        buildPlayer({
          surnamePrefix: 'van den',
          surname: 'Berg',
          surnameSuffix: 'sr.',
        }),
      ),
    ).toBe('van den Berg sr.');
  });
});
