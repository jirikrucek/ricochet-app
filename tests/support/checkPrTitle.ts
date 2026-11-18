import { commitProblem } from './conventions.ts';

// Fails when the pull request title (PR_TITLE) breaks Conventional Commits
// (AGENTS.md): a squash merge can make it the commit message on main. Runs
// in .github/workflows/pr-title.yml, which runs again whenever the title is
// edited.

const title = process.env.PR_TITLE ?? '';
const why = commitProblem(title);

if (why) {
  console.error(
    `Pull request title "${title}": ${why}. Edit the title; the check runs again.`,
  );
  process.exit(1);
}

console.log(`Pull request title "${title}" follows Conventional Commits.`);
