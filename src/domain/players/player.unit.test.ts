import { describe, expect, it } from 'vitest';

import { formatSurname } from './player';
import { buildPlayer } from './playerMocks';

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
