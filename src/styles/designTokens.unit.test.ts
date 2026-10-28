import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

// DESIGN.md is the source of the tokens and globals.css must match it
// (docs/standards/design-system-standard.md). globals.css may define more
// (the shadcn aliases, layout sizes); every DESIGN.md token must be in it
// with the same value.
const root = path.resolve(import.meta.dirname, '../..');
const designMd = readFileSync(path.join(root, 'DESIGN.md'), 'utf8');
const css = readFileSync(path.join(root, 'src/styles/globals.css'), 'utf8');

const frontMatter = parse(designMd.split('---')[1]) as {
  colors: Record<string, string>;
  spacing: Record<string, string>;
  rounded: Record<string, string>;
  typography: Record<string, { fontSize: string }>;
};

function cssValue(property: string) {
  const match = css.match(new RegExp(`(?<![\\w-])${property}:\\s*([^;]+);`));
  return match?.[1].trim().toLowerCase();
}

const categories = [
  ['colors', '--color', frontMatter.colors],
  ['spacing', '--spacing', frontMatter.spacing],
  ['rounded', '--radius', frontMatter.rounded],
  [
    'typography font sizes',
    '--text',
    Object.fromEntries(
      Object.entries(frontMatter.typography).map(([name, style]) => [
        name,
        style.fontSize,
      ]),
    ),
  ],
] as const;

describe('globals.css matches DESIGN.md', () => {
  it.each(categories)('%s', (_name, prefix, tokens) => {
    expect(Object.keys(tokens).length).toBeGreaterThan(0);
    const actual = Object.fromEntries(
      Object.keys(tokens).map((key) => [key, cssValue(`${prefix}-${key}`)]),
    );
    const expected = Object.fromEntries(
      Object.entries(tokens).map(([key, value]) => [
        key,
        String(value).toLowerCase(),
      ]),
    );

    expect(actual).toEqual(expected);
  });
});
