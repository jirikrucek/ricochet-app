import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';

import {
  applyExceptions,
  findBrokenReferences,
  type Exception,
  type ReferenceKinds,
} from './docReferences.ts';

// Fails when a doc, skill or spec references a file, folder or skill that
// doesn't exist. Checks the tracked files of the repository at the given
// root (default: this checkout), so it can also run against an old commit
// checked out elsewhere.
//
// Each kind of reference is checked only where it can't be a false alarm:
// links everywhere; skills in the harness (AGENTS.md, skills, guides,
// standards, OpenSpec config), not in specs and ADRs, which name app routes
// as /players; backticked paths in the docs that describe the repository as
// it is now, and only file paths in skills, which name example folders, not
// in ADRs, which name old paths on purpose.

const root = path.resolve(
  process.argv[2] ?? path.join(import.meta.dirname, '../..'),
);

const LINKS =
  /^(AGENTS|CLAUDE|DESIGN|README)\.md$|^(docs|glossary|\.agents\/skills|openspec\/specs|openspec\/schemas)\/.*\.md$/;
const SKILLS =
  /^AGENTS\.md$|^(\.agents\/skills|docs\/guides|docs\/standards|openspec\/schemas)\/.*\.(md|ya?ml)$|^openspec\/config\.yaml$/;
const ALL_PATHS =
  /^AGENTS\.md$|^docs\/(guides|standards|references)\/.*\.md$|^openspec\/config\.yaml$/;
const FILE_PATHS = /^\.agents\/skills\/.*\.md$/;

function kindsOf(file: string): ReferenceKinds {
  return {
    links: LINKS.test(file),
    skills: SKILLS.test(file),
    paths: ALL_PATHS.test(file) ? 'all' : FILE_PATHS.test(file) && 'files',
  };
}

// Broken references in vendored skills, which `skills update` overwrites,
// so they can't be fixed in place. Each names a skill of the upstream
// collection that isn't installed here.
const EXCEPTIONS: Exception[] = [
  {
    file: '.agents/skills/tdd/SKILL.md',
    reference: '`code-review` skill',
    reason:
      'mattpocock/skills names its own code-review skill; here /code-review-and-quality and /code-health cover review',
    expires: '2027-02-18',
    approvedBy: 'jirikrucek (2026-11-18)',
  },
  {
    file: '.agents/skills/observability-and-instrumentation/SKILL.md',
    reference: '`debugging-and-error-recovery` skill',
    reason:
      'addyosmani/agent-skills names its own debugging skill; here /diagnosing-bugs covers it',
    expires: '2027-02-18',
    approvedBy: 'jirikrucek (2026-11-18)',
  },
  {
    file: '.agents/skills/security-and-hardening/SKILL.md',
    reference: '`debugging-and-error-recovery` skill',
    reason:
      'addyosmani/agent-skills names its own debugging skill; here /diagnosing-bugs covers it',
    expires: '2027-02-18',
    approvedBy: 'jirikrucek (2026-11-18)',
  },
];

const git = (...args: string[]) =>
  execFileSync('git', ['-C', root, ...args], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });

const tracked = git('ls-files', '-z').split('\0').filter(Boolean);
const trackedPaths = new Set(tracked);
const trackedFolders = new Set(
  tracked.flatMap((file) =>
    file
      .split('/')
      .slice(0, -1)
      .map((_, index, parts) => `${parts.slice(0, index + 1).join('/')}/`),
  ),
);

function isTracked(relativePath: string) {
  const normalized = path.posix.normalize(relativePath);
  return (
    trackedPaths.has(normalized.replace(/\/$/, '')) ||
    trackedFolders.has(normalized.endsWith('/') ? normalized : `${normalized}/`)
  );
}

// A gitignored path, such as the generated src/routeTree.gen.ts or the local
// supabase/data/, counts as existing: a fresh checkout doesn't have it yet.
function isIgnored(relativePath: string) {
  try {
    // Silent: for a path outside the repository git prints a fatal error.
    execFileSync(
      'git',
      ['-C', root, 'check-ignore', '-q', '--no-index', '--', relativePath],
      { stdio: 'ignore' },
    );
    return true;
  } catch {
    return false;
  }
}

// Decided from git, not from the files on disk, so a file that is only on
// this machine doesn't pass here and fail in CI. A path through a symlink,
// such as .claude/skills/, counts when its target is tracked.
function exists(relativePath: string) {
  if (isTracked(relativePath)) return true;
  const absolute = path.join(root, relativePath);
  if (existsSync(absolute)) {
    const target = path.relative(root, realpathSync(absolute));
    if (isTracked(target.split(path.sep).join('/'))) return true;
  }
  return isIgnored(relativePath);
}

const repository = {
  exists,
  skills: new Set(
    tracked.flatMap(
      (file) =>
        file.match(/^\.agents\/skills\/([^/.][^/]*)\/SKILL\.md$/)?.[1] ?? [],
    ),
  ),
};

const checked = tracked.filter((file) =>
  Object.values(kindsOf(file)).some(Boolean),
);
// Claude Code reads a skill from its .claude/skills/<name> symlink, so a
// relative path in it resolves from there too, as GitHub Copilot's
// .agents/skills/<name> does: check a skill's links and paths from both.
function claudeCopyOf(file: string) {
  const skill = file.match(/^\.agents\/skills\/([^/]+)\//)?.[1];
  return skill && trackedPaths.has(`.claude/skills/${skill}`)
    ? file.replace(/^\.agents\//, '.claude/')
    : undefined;
}

const found = checked.flatMap((file) => {
  const text = readFileSync(path.join(root, file), 'utf8');
  const kinds = kindsOf(file);
  const claudeCopy = claudeCopyOf(file);
  return [
    ...findBrokenReferences({ file, text, kinds }, repository),
    ...(claudeCopy
      ? findBrokenReferences(
          { file: claudeCopy, text, kinds: { ...kinds, skills: false } },
          repository,
        )
          // Only what resolves differently from .claude/: relative paths.
          .filter(({ resolved }) => resolved?.startsWith('.claude/'))
          .map((reference) => ({
            ...reference,
            file,
            reason: `${reference.reason}, where Claude Code reads it`,
          }))
      : []),
  ];
});
const today = new Date().toISOString().slice(0, 10);
const { broken, stale } = applyExceptions(found, EXCEPTIONS, today);

if (broken.length > 0) {
  console.error(
    `${broken.length} reference(s) in ${checked.length} docs, skills and specs point at nothing. Fix the reference, or restore what it names:`,
  );
  for (const { file, line, reference, reason } of broken) {
    console.error(`  ${file}:${line}  ${reference}  (${reason})`);
  }
}

if (stale.length > 0) {
  if (broken.length > 0) console.error('');
  console.error(
    `${stale.length} exception(s) in tests/support/checkDocReferences.ts no longer apply. Delete each, or fix its reference:`,
  );
  for (const { exception, why } of stale) {
    console.error(`  ${exception.file}  ${exception.reference}  (${why})`);
  }
}

if (broken.length > 0 || stale.length > 0) process.exit(1);

console.log(
  `All references in ${checked.length} docs, skills and specs resolve (${EXCEPTIONS.length} allowed by an exception).`,
);
