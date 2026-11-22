// The pure core of the doc reference check: the references in a document
// that point at nothing. checkDocReferences.ts feeds it the repository's
// docs, skills and specs. Agents copy and move these files, and a reference
// left pointing at a moved file or a removed skill sends the next agent to
// nothing.

import path from 'node:path';

/** Which kinds of reference to check in a document. */
export type ReferenceKinds = {
  /** Relative Markdown links, `[text](path)`. */
  links: boolean;
  /** Skills, named as `/skill-name` or as "the `skill-name` skill". */
  skills: boolean;
  /**
   * Paths in backticks, such as `docs/guides/testing-guide.md` or
   * `../references/x.md`: `all` checks files and folders, `files` only
   * files (with an extension), for docs whose folders are often examples.
   */
  paths: 'all' | 'files' | false;
};

export type Repository = {
  /** Whether a path, relative to the repository root, exists. */
  exists: (relativePath: string) => boolean;
  /** The names of the installed skills. */
  skills: ReadonlySet<string>;
};

export type BrokenReference = {
  file: string;
  line: number;
  reference: string;
  reason: string;
  /** For a link or path, where it resolves, relative to the root. */
  resolved?: string;
};

/**
 * A broken reference allowed on purpose, in a file this repository can't
 * fix in place, such as a vendored skill that `skills update` overwrites.
 */
export type Exception = {
  file: string;
  reference: string;
  reason: string;
  /** The day after which the exception fails the check, `YYYY-MM-DD`. */
  expires: string;
  approvedBy: string;
};

// Top-level folders whose paths a doc names; a backticked path counts only
// when it starts with one of them, or with ../.
const REPOSITORY_FOLDERS = [
  '.agents/',
  '.claude/',
  '.github/',
  'docs/',
  'glossary/',
  'openspec/',
  'public/',
  'src/',
  'supabase/',
  'tests/',
];

// Words written as `/word` that name no skill, with the reason.
export const NOT_SKILLS: ReadonlyMap<string, string> = new Map([
  ['tmp', 'the OS temp directory, in the handoff and architecture skills'],
  ['settings', 'an example app route, in the prototype skill'],
  ['clear', 'a built-in agent command'],
  ['compact', 'a built-in agent command'],
]);

/** The text with fenced code blocks blanked out, keeping the line numbers. */
function withoutCodeBlocks(text: string) {
  // A fence may be indented (inside a list item) and longer than three
  // characters (to hold a shorter fence); it closes on a fence of the same
  // character, at least as long, with nothing after it.
  let open: { char: string; length: number } | undefined;
  return text
    .split('\n')
    .map((line) => {
      const fence = line.match(/^\s*(`{3,}|~{3,})(.*)$/);
      if (!open) {
        if (!fence) return line;
        open = { char: fence[1][0], length: fence[1].length };
        return '';
      }
      if (
        fence &&
        fence[1][0] === open.char &&
        fence[1].length >= open.length &&
        !fence[2].trim()
      ) {
        open = undefined;
      }
      return '';
    })
    .join('\n');
}

function lineOf(text: string, index: number) {
  return text.slice(0, index).split('\n').length;
}

function linkTargets(text: string, file: string) {
  return [...text.matchAll(/\]\(([^)\s]+)\)/g)].flatMap((match) => {
    const target = match[1].split('#')[0];
    // URLs (https:, mailto:), anchors within the page and <placeholders>.
    if (!target || /^[a-z][a-z0-9+.-]*:/i.test(target)) return [];
    if (target.startsWith('<')) return [];
    const resolved = target.startsWith('/')
      ? target.slice(1)
      : path.posix.join(path.posix.dirname(file), decodeURI(target));
    return [{ index: match.index, reference: match[1], resolved }];
  });
}

function skillNames(text: string) {
  // A whole backticked token (`/pr`), a word after whitespace (run /pr),
  // not part of a path (`package.json`/build-tool) or a regex (/status of/),
  // or "the `pr` skill".
  return [
    ...text.matchAll(
      /(?<=`)\/([a-z][a-z0-9-]*)(?=`)|(?<=^|\s)\/([a-z][a-z0-9-]*)(?=[\s),.;:]|$)|`([a-z][a-z0-9-]*)` skill\b/gm,
    ),
  ].map((match) => ({
    index: match.index,
    name: match[1] ?? match[2] ?? match[3],
    reference: match[0],
  }));
}

function pathTargets(text: string, file: string, scope: 'all' | 'files') {
  return [...text.matchAll(/`([^`\s]+)`/g)].flatMap((match) => {
    // Drop a line number or an anchor: `src/main.tsx:12`, `x.md#part`.
    const target = match[1].replace(/[:#].*$/, '');
    const relative = target.startsWith('../');
    if (!relative && !REPOSITORY_FOLDERS.some((f) => target.startsWith(f))) {
      return [];
    }
    // Placeholders and globs, such as `openspec/changes/<name>/`.
    if (/[<>*{}$[\]]/.test(target)) return [];
    // A file has an extension, a folder a trailing /; anything else, such
    // as the GitHub Action `supabase/setup-cli`, is no path.
    const isFile = /\.[a-z0-9]+$/i.test(target);
    if (!isFile && !(scope === 'all' && target.endsWith('/'))) return [];
    const resolved = relative
      ? path.posix.join(path.posix.dirname(file), target)
      : target;
    return [{ index: match.index, reference: match[1], resolved }];
  });
}

/** The references in a document that point at nothing. */
export function findBrokenReferences(
  document: { file: string; text: string; kinds: ReferenceKinds },
  repository: Repository,
): BrokenReference[] {
  const { file, kinds } = document;
  const text = withoutCodeBlocks(document.text);
  const broken: BrokenReference[] = [];
  const report = (
    index: number,
    reference: string,
    reason: string,
    resolved?: string,
  ) =>
    broken.push({
      file,
      line: lineOf(text, index),
      reference,
      reason,
      ...(resolved && { resolved }),
    });

  if (kinds.links) {
    for (const { index, reference, resolved } of linkTargets(text, file)) {
      if (!repository.exists(resolved)) {
        report(index, reference, `no file at ${resolved}`, resolved);
      }
    }
  }

  if (kinds.skills) {
    for (const { index, name, reference } of skillNames(text)) {
      if (repository.skills.has(name) || NOT_SKILLS.has(name)) continue;
      report(
        index,
        reference,
        `no skill named ${name} in .agents/skills/; if /${name} is not a skill, add it to NOT_SKILLS in checks/docReferences.ts`,
      );
    }
  }

  if (kinds.paths) {
    for (const { index, reference, resolved } of pathTargets(
      text,
      file,
      kinds.paths,
    )) {
      if (!repository.exists(resolved)) {
        report(index, reference, `no file or folder at ${resolved}`, resolved);
      }
    }
  }

  return broken;
}

/**
 * The broken references no exception allows, and the exceptions that no
 * longer apply: expired by `today` (`YYYY-MM-DD`), or matching no broken
 * reference, so they can be deleted.
 */
export function applyExceptions(
  broken: BrokenReference[],
  exceptions: readonly Exception[],
  today: string,
): {
  broken: BrokenReference[];
  stale: { exception: Exception; why: string }[];
} {
  const matches = (exception: Exception, reference: BrokenReference) =>
    exception.file === reference.file &&
    exception.reference === reference.reference;
  const active = exceptions.filter((exception) => exception.expires >= today);
  return {
    broken: broken.filter(
      (reference) => !active.some((exception) => matches(exception, reference)),
    ),
    stale: exceptions.flatMap((exception) => {
      if (exception.expires < today) {
        return [{ exception, why: `expired on ${exception.expires}` }];
      }
      if (!broken.some((reference) => matches(exception, reference))) {
        return [{ exception, why: 'the reference is fixed or gone' }];
      }
      return [];
    }),
  };
}
