// The pure core of the conventions check: whether a branch name follows
// Conventional Branch (https://conventionalbranch.org/) and a commit subject
// follows Conventional Commits (https://www.conventionalcommits.org/), as
// AGENTS.md requires. checkConventions.ts feeds it the branch and its commits.

const TRUNK_BRANCHES = ['main', 'master', 'develop'];

// The Conventional Branch types, including those for AI agents.
const BRANCH_TYPES = [
  'feature',
  'feat',
  'bugfix',
  'fix',
  'hotfix',
  'release',
  'chore',
  'ai',
  'claude',
  'codex',
  'copilot',
  'cursor',
];

// The commit types of @commitlint/config-conventional.
const COMMIT_TYPES = [
  'build',
  'chore',
  'ci',
  'docs',
  'feat',
  'fix',
  'perf',
  'refactor',
  'revert',
  'style',
  'test',
];

// Lowercase letters and digits, words joined by single hyphens or dots.
const DESCRIPTION = '[a-z0-9]+(?:[-.][a-z0-9]+)*';

const branchPattern = new RegExp(
  `^(?:${BRANCH_TYPES.join('|')})/${DESCRIPTION}$`,
);
const commitPattern = new RegExp(
  `^(?:${COMMIT_TYPES.join('|')})(?:\\([^()]+\\))?!?: \\S`,
);
// The subjects `git revert` writes: Revert "<subject>", and Reapply
// "<subject>" when it reverts a revert.
const gitRevertPattern = /^(?:Revert|Reapply) ".+"$/;

/** Why a branch name breaks Conventional Branch, or undefined if it doesn't. */
export function branchProblem(branch: string): string | undefined {
  if (TRUNK_BRANCHES.includes(branch) || branchPattern.test(branch)) {
    return undefined;
  }
  return `expected <type>/<description>: a type of ${BRANCH_TYPES.join(', ')}, then lowercase letters, digits, and single hyphens or dots between them`;
}

/** Why a commit subject breaks Conventional Commits, or undefined. */
export function commitProblem(subject: string): string | undefined {
  if (commitPattern.test(subject) || gitRevertPattern.test(subject)) {
    return undefined;
  }
  return `expected <type>[(scope)][!]: <description>, with a type of ${COMMIT_TYPES.join(', ')}`;
}
