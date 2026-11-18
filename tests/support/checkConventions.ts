import { execFileSync } from 'node:child_process';

import { branchProblem, commitProblem } from './conventions.ts';

// Fails when the branch name breaks Conventional Branch, or a commit on it
// breaks Conventional Commits (AGENTS.md). Checks the commits from BASE_REF
// (default main, preferring origin/main when it exists) to HEAD_REF (default
// HEAD), merges left out. BRANCH names the branch when HEAD is detached, as
// in CI, where the checkout is a pull request's merge commit.
// SKIP_BRANCH_CHECK=true skips the branch name, for a Dependabot pull
// request, whose branch name Dependabot chooses; its commits are checked.

const git = (...args: string[]) =>
  execFileSync('git', args, { encoding: 'utf8' }).trim();

function refExists(ref: string) {
  try {
    git('rev-parse', '--verify', '--quiet', '--end-of-options', ref);
    return true;
  } catch {
    return false;
  }
}

const baseName = process.env.BASE_REF || 'main';
const base = refExists(`origin/${baseName}`) ? `origin/${baseName}` : baseName;
const head = process.env.HEAD_REF || 'HEAD';
const branch = process.env.BRANCH || git('rev-parse', '--abbrev-ref', 'HEAD');

if (branch === 'HEAD') {
  console.error('HEAD is detached: set BRANCH to the branch name.');
  process.exit(1);
}

const commits = git(
  'log',
  '--no-merges',
  '--format=%h %s',
  '--end-of-options',
  `${base}..${head}`,
)
  .split('\n')
  .filter(Boolean)
  .map((line) => {
    const [hash, ...subject] = line.split(' ');
    return { hash, subject: subject.join(' ') };
  });

const problems = [
  ...[
    process.env.SKIP_BRANCH_CHECK === 'true'
      ? undefined
      : branchProblem(branch),
  ].flatMap((why) => (why ? [`branch ${branch}: ${why}`] : [])),
  ...commits.flatMap(({ hash, subject }) => {
    const why = commitProblem(subject);
    return why ? [`commit ${hash} "${subject}": ${why}`] : [];
  }),
];

if (problems.length > 0) {
  console.error(
    `The branch or its commits break the conventions in AGENTS.md. Rename the branch (git branch -m) or reword the commits (git rebase), then push again:`,
  );
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}

console.log(
  process.env.SKIP_BRANCH_CHECK === 'true'
    ? `Branch name ${branch} not checked; its ${commits.length} commit(s) since ${base} follow Conventional Commits.`
    : `Branch ${branch} and its ${commits.length} commit(s) since ${base} follow Conventional Branch and Conventional Commits.`,
);
