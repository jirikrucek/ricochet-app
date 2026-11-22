import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { findRepoRoot } from './repoRoot';

const tempDirs: string[] = [];

function packageAt(name: string) {
  const root = mkdtempSync(path.join(tmpdir(), 'repo-root-'));
  tempDirs.push(root);
  writeFileSync(path.join(root, 'package.json'), JSON.stringify({ name }));
  const deep = path.join(root, 'a', 'b', 'c');
  mkdirSync(deep, { recursive: true });
  return { root, deep };
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe('findRepoRoot', () => {
  it('finds this repository from the checks folder', () => {
    expect(findRepoRoot(import.meta.dirname)).toBe(
      path.resolve(import.meta.dirname, '..'),
    );
  });

  it('walks up any number of folders to the nearest package.json', () => {
    const { root, deep } = packageAt('ricochet-app');

    expect(findRepoRoot(deep)).toBe(root);
    expect(findRepoRoot(root)).toBe(root);
  });

  it("fails with a clear error when the nearest package.json isn't this project's", () => {
    const { root, deep } = packageAt('some-other-package');

    expect(() => findRepoRoot(deep)).toThrow(
      `The nearest package.json above ${deep}, in ${root}, is "some-other-package", not ricochet-app`,
    );
  });
});
