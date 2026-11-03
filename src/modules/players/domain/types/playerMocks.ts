import type { Player } from './player';

// Mock data builders for unit tests (docs/standards/testing-standard.md). Fictional
// people only.

let nextId = 1;

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
