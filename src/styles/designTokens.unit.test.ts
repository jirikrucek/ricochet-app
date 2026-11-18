import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { compile } from 'tailwindcss';
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

// Tailwind looks a width utility's name up in --spacing-* before
// --container-*, so a spacing token named xs to xl turned max-w-sm into 8px
// (#89, #92). globals.css points these names back at the container scale.
describe('width utilities use the Tailwind container scale', () => {
  const containerWidths = {
    xs: '20rem',
    sm: '24rem',
    md: '28rem',
    lg: '32rem',
    xl: '36rem',
  };
  const utilities = [
    { prefix: 'w', property: 'width' },
    { prefix: 'min-w', property: 'min-width' },
    { prefix: 'max-w', property: 'max-width' },
    { prefix: 'basis', property: 'flex-basis' },
  ];
  const require = createRequire(import.meta.url);

  async function build(candidates: string[]) {
    const compiler = await compile(css, {
      base: path.join(root, 'src/styles'),
      // Only Tailwind itself matters here; the font stylesheets are skipped.
      loadStylesheet: async (id, base) =>
        id === 'tailwindcss'
          ? {
              path: require.resolve('tailwindcss/index.css'),
              base,
              content: readFileSync(
                require.resolve('tailwindcss/index.css'),
                'utf8',
              ),
            }
          : { path: id, base, content: '' },
    });
    return compiler.build(candidates);
  }

  function resolve(output: string, value: string): string {
    const variable = value.match(/^var\((--[\w-]+)\)$/)?.[1];
    if (!variable) return value;
    const definition = output.match(
      new RegExp(`(?<![\\w-])${variable}:\\s*([^;]+);`),
    )?.[1];
    return definition ? resolve(output, definition.trim()) : value;
  }

  it.each(utilities)(
    '$prefix-xs to $prefix-xl',
    async ({ prefix, property }) => {
      const output = await build(
        Object.keys(containerWidths).map((name) => `${prefix}-${name}`),
      );
      const actual = Object.fromEntries(
        Object.keys(containerWidths).map((name) => {
          const rule = output.match(
            new RegExp(`\\.${prefix}-${name} \\{\\s*${property}: ([^;]+);`),
          )?.[1];
          return [name, rule && resolve(output, rule)];
        }),
      );

      expect(actual).toEqual(containerWidths);
    },
  );
});
