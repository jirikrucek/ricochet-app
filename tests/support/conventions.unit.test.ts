import { describe, expect, it } from 'vitest';

import { branchProblem, commitProblem } from './conventions';

describe('branchProblem', () => {
  it.each([
    'main',
    'chore/update-engineering-harness',
    'feature/collapsible-filters',
    'fix/sheet-width',
    'release/v1.2.0',
    'chore/update-openspec-2.1.0',
    'claude/github-issue-89-fhn6e1',
    'copilot/fix-code-for-review-comment',
  ])('accepts %s', (branch) => {
    expect(branchProblem(branch)).toBeUndefined();
  });

  it.each([
    'ci/run-checks-in-parallel',
    'test/trace-e2e-tests',
    'docs/guides',
    'dependabot/npm_and_yarn/eslint-10.11.0',
    'jirikrucek-patch-1',
    'Chore/update-engineering-harness',
    'feature/Create-overview',
    'fix/sheet--width',
    'fix/-sheet',
    'release/v1.2.',
    'fix/sheet-.width',
    'fix/',
  ])('rejects %s', (branch) => {
    expect(branchProblem(branch)).toMatch(/^expected <type>\/<description>/);
  });
});

describe('commitProblem', () => {
  it.each([
    'feat: add players overview',
    'fix(ui): stop tooltip collapsing to 4px wide',
    'chore(deps-dev): bump eslint from 9.39.5 to 10.11.0',
    'refactor(players)!: page the overview in the backend',
    'docs(dependabot, agents): clarify the schedule comment',
    'Revert "fix(skills): pass the fixed point to the shell only as a quoted value"',
    'Reapply "fix(skills): pass the fixed point to the shell only as a quoted value"',
  ])('accepts %s', (subject) => {
    expect(commitProblem(subject)).toBeUndefined();
  });

  it.each([
    'Remove npm updates configuration from dependabot',
    'Initial plan',
    'Update status and metadata in ADR 0007',
    'feature: add players overview',
    'fix:missing space',
    'fix(): empty scope',
    'Fix(ui): capitalised type',
  ])('rejects %s', (subject) => {
    expect(commitProblem(subject)).toMatch(/^expected <type>/);
  });

  it("accepts Copilot Autofix's generated subject with its co-author trailer", () => {
    expect(
      commitProblem(
        'Potential fix for pull request finding',
        'Co-authored-by: Copilot Autofix powered by AI <62310815+github-advanced-security[bot]@users.noreply.github.com>',
      ),
    ).toBeUndefined();
  });

  it("rejects Copilot Autofix's generated subject without its co-author trailer", () => {
    expect(commitProblem('Potential fix for pull request finding')).toMatch(
      /^expected <type>/,
    );
  });

  it('rejects other nonconforming subjects with the Copilot Autofix trailer', () => {
    expect(
      commitProblem(
        'Potential fix',
        'Co-authored-by: Copilot Autofix powered by AI <62310815+github-advanced-security[bot]@users.noreply.github.com>',
      ),
    ).toMatch(/^expected <type>/);
  });
});
