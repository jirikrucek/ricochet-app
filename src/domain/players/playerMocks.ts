import type { Player, PlayerRowInput } from './player';

// Mock data builders for unit tests (docs/standards/testing.md). Fictional
// people only.

let nextId = 1;

export function buildPlayerRow(
  overrides: Partial<PlayerRowInput> = {},
): PlayerRowInput {
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

export function buildPlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: nextId++,
    firstName: 'Alex',
    surname: 'Example',
    nationality: 'CZ',
    sex: 'male',
    ...overrides,
  };
}
