import type { PlayerRow } from './playerRow';

// Mock rows for unit tests of the players repository's mapping
// (docs/standards/testing-standard.md). Fictional people only.

let nextId = 1;

export function buildPlayerRow(overrides: Partial<PlayerRow> = {}): PlayerRow {
  return {
    id: nextId++,
    first_name: 'Alex',
    surname_prefix: null,
    surname: 'Example',
    surname_suffix: null,
    nationality: 'CZ',
    sex: 'male',
    ...overrides,
  };
}
