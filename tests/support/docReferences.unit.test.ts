import { describe, expect, it } from 'vitest';

import {
  applyExceptions,
  findBrokenReferences,
  type BrokenReference,
  type Exception,
  type ReferenceKinds,
} from './docReferences';

const repository = {
  exists: (relativePath: string) =>
    [
      'AGENTS.md',
      'docs/',
      'docs/guides/',
      'docs/guides/testing-guide.md',
      'docs/references/',
      'docs/references/accessibility-checklist.md',
    ].includes(relativePath),
  skills: new Set(['pr', 'code-health']),
};

const all: ReferenceKinds = { links: true, skills: true, paths: 'all' };

function brokenIn(
  text: string,
  { file = 'docs/standards/x.md', kinds = all } = {},
) {
  return findBrokenReferences({ file, text, kinds }, repository).map(
    ({ line, reference }) => `${line}: ${reference}`,
  );
}

describe('findBrokenReferences', () => {
  it('resolves links from the document folder, or the root with a leading /', () => {
    expect(
      brokenIn(
        [
          '[ok](../guides/testing-guide.md#seed)',
          '[ok](/AGENTS.md)',
          '[moved](../guides/e2e-tests.md)',
          '[gone](/docs/references/definition-of-done.md)',
        ].join('\n'),
      ),
    ).toEqual([
      '3: ../guides/e2e-tests.md',
      '4: /docs/references/definition-of-done.md',
    ]);
  });

  it('skips URLs, anchors within the page, placeholders and code blocks', () => {
    expect(
      brokenIn(
        [
          '[a](https://example.com/x.md) [b](#part) [c](<comment URL>)',
          '```md',
          '[d](missing.md) `/missing-skill` `docs/missing.md`',
          '```',
        ].join('\n'),
      ),
    ).toEqual([]);
  });

  it('finds a skill named as /name or as the `name` skill that is not installed', () => {
    expect(
      brokenIn(
        [
          'Run `/pr`, then /code-health.',
          'Run `/openspec-propose`, or run /implement-spec next.',
          'Call the `writing-for-agents` skill.',
        ].join('\n'),
      ),
    ).toEqual([
      '2: /openspec-propose',
      '2: /implement-spec',
      '3: `writing-for-agents` skill',
    ]);
  });

  it('does not read paths, regexes or listed words as skills', () => {
    expect(
      brokenIn(
        [
          'Read `package.json`/build-tool scripts and docs/guides/x.',
          'Allow `allowConsoleErrors(/status of 500/)`.',
          'Save to `/tmp`, then /clear the context.',
        ].join('\n'),
        { kinds: { links: false, skills: true, paths: false } },
      ),
    ).toEqual([]);
  });

  it('checks backticked repository paths, files and folders', () => {
    expect(
      brokenIn(
        [
          'See `docs/guides/testing-guide.md:20` in `docs/guides/`.',
          'See `docs/references/definition-of-done.md` in `src/client-api/`.',
          'Not paths: `openspec/changes/<name>/`, `src/**/*.ts`, `supabase/setup-cli`, `README.md`.',
        ].join('\n'),
      ),
    ).toEqual([
      '2: docs/references/definition-of-done.md',
      '2: src/client-api/',
    ]);
  });

  it('checks only files when the paths kind is files, resolving ../ from the document', () => {
    expect(
      brokenIn(
        [
          'See `../../../docs/references/accessibility-checklist.md`.',
          'See `../../references/accessibility-checklist.md`.',
          'Example folders: `docs/runbooks/`, `public/r`.',
        ].join('\n'),
        {
          file: '.agents/skills/frontend-ui-engineering/SKILL.md',
          kinds: { links: true, skills: true, paths: 'files' },
        },
      ),
    ).toEqual(['2: ../../references/accessibility-checklist.md']);
  });
});

describe('applyExceptions', () => {
  const reference = (file: string): BrokenReference => ({
    file,
    line: 1,
    reference: '`code-review` skill',
    reason: 'no skill',
  });
  const exception = (file: string, expires: string): Exception => ({
    file,
    reference: '`code-review` skill',
    reason: 'vendored',
    expires,
    approvedBy: 'someone',
  });

  it('allows a matching reference until the exception expires', () => {
    const result = applyExceptions(
      [reference('a.md'), reference('b.md')],
      [exception('a.md', '2027-01-01')],
      '2027-01-01',
    );

    expect(result.broken.map(({ file }) => file)).toEqual(['b.md']);
    expect(result.stale).toEqual([]);
  });

  it('reports an expired exception and stops allowing its reference', () => {
    const result = applyExceptions(
      [reference('a.md')],
      [exception('a.md', '2026-12-31')],
      '2027-01-01',
    );

    expect(result.broken.map(({ file }) => file)).toEqual(['a.md']);
    expect(result.stale.map(({ why }) => why)).toEqual([
      'expired on 2026-12-31',
    ]);
  });

  it('reports an exception that matches no broken reference', () => {
    const result = applyExceptions(
      [],
      [exception('a.md', '2027-12-31')],
      '2027-01-01',
    );

    expect(result.stale.map(({ why }) => why)).toEqual([
      'the reference is fixed or gone',
    ]);
  });
});
