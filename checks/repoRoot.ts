import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const PACKAGE_NAME = 'ricochet-app';

/**
 * The repository root: the nearest folder at or above `from` that holds a
 * package.json, which must be this project's. Walking up, rather than a
 * fixed `'..'`, keeps a check pointed at the right tree when it moves to
 * another folder depth (#160); the name check stops it from settling on an
 * unrelated package.json above the repository.
 */
export function findRepoRoot(from: string): string {
  let dir = path.resolve(from);
  while (!existsSync(path.join(dir, 'package.json'))) {
    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error(
        `No package.json at or above ${from}: can't find the repository root.`,
      );
    }
    dir = parent;
  }
  const { name } = JSON.parse(
    readFileSync(path.join(dir, 'package.json'), 'utf8'),
  ) as { name?: unknown };
  if (name !== PACKAGE_NAME) {
    throw new Error(
      `The nearest package.json above ${from}, in ${dir}, is ${JSON.stringify(name)}, not ${PACKAGE_NAME}: can't find the repository root.`,
    );
  }
  return dir;
}
