import { execFileSync } from 'node:child_process';
import path from 'node:path';

import {
  applyDeltas,
  isProposalDone,
  INTERNALS_DIR,
  isInternalsTest,
  listScenarios,
  testsCoveringNoScenario,
  uncoveredScenarios,
  type ChangeStatus,
  type Delta,
  type E2eTest,
  type Requirement,
  type SpecRequirements,
} from './scenarioCoverage.ts';

// Fails when a spec scenario in force (the main specs with every active
// change applied) has no E2E test titled with its name, in a describe
// block titled with its requirement name, or when an E2E test outside
// tests/e2e/internals/ covers no such scenario
// (docs/standards/testing-standard.md). Lists the tests with
// `playwright test --list`, so it needs neither Supabase nor a browser.
// An active change whose proposal isn't written yet has no delta specs, so
// it is skipped, and the run names it.

const root = path.resolve(import.meta.dirname, '../..');

function runJson<T>(bin: string, args: string[]): T {
  const output = execFileSync(path.join(root, 'node_modules/.bin', bin), args, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  return JSON.parse(output) as T;
}

const openspec = <T>(...args: string[]) => runJson<T>('openspec', args);

function mainSpecs(): SpecRequirements {
  const { specs } = openspec<{ specs: { id: string }[] }>(
    'list',
    '--specs',
    '--json',
  );
  return new Map(
    specs.map(({ id }) => {
      const spec = openspec<{ requirements: Requirement[] }>(
        'show',
        id,
        '--type',
        'spec',
        '--json',
      );
      return [id, spec.requirements];
    }),
  );
}

/**
 * The delta specs of the active changes, and the names of the changes
 * skipped because their proposal isn't written yet.
 */
function activeDeltas(): { deltas: Delta[]; skipped: string[] } {
  const { changes } = openspec<{ changes: { name: string }[] }>(
    'list',
    '--json',
  );
  const deltas: Delta[] = [];
  const skipped: string[] = [];
  for (const { name } of changes) {
    const status = openspec<ChangeStatus>('status', '--change', name, '--json');
    if (!isProposalDone(status)) {
      skipped.push(name);
      continue;
    }
    deltas.push(
      ...openspec<{ deltas: Delta[] }>(
        'show',
        name,
        '--type',
        'change',
        '--json',
        '--deltas-only',
      ).deltas,
    );
  }
  return { deltas, skipped };
}

type PlaywrightSuite = {
  title: string;
  specs?: { title: string }[];
  suites?: PlaywrightSuite[];
};

function e2eTests(): E2eTest[] {
  const report = runJson<{
    suites: PlaywrightSuite[];
    errors: { message: string }[];
  }>('playwright', ['test', '--list', '--reporter=json']);
  if (report.errors.length > 0) {
    throw new Error(report.errors.map(({ message }) => message).join('\n'));
  }

  const tests: E2eTest[] = [];
  const walk = (suite: PlaywrightSuite, file: string, describes: string[]) => {
    for (const test of suite.specs ?? []) {
      tests.push({ file, titlePath: [...describes, test.title] });
    }
    for (const child of suite.suites ?? []) {
      walk(child, file, [...describes, child.title]);
    }
  };
  // The top-level suites are the spec files; their titles are file paths
  // relative to tests/e2e.
  for (const specFile of report.suites) {
    walk(specFile, specFile.title, []);
  }
  return tests;
}

const { deltas, skipped } = activeDeltas();
const scenarios = listScenarios(applyDeltas(mainSpecs(), deltas));
const tests = e2eTests();
const uncovered = uncoveredScenarios(scenarios, tests);
const orphans = testsCoveringNoScenario(scenarios, tests);
const checked = tests.filter((test) => !isInternalsTest(test));

if (uncovered.length > 0) {
  console.error(
    `${uncovered.length} of ${scenarios.length} spec scenarios have no E2E test titled with the scenario name, in a describe block titled with the requirement name (see docs/standards/testing-standard.md):`,
  );
  for (const { spec, requirement, name } of uncovered) {
    console.error(`  ${spec} › ${requirement} › ${name}`);
  }
}

if (orphans.length > 0) {
  if (uncovered.length > 0) console.error('');
  console.error(
    `${orphans.length} of ${checked.length} E2E tests outside tests/e2e/${INTERNALS_DIR} cover no spec scenario. Add a scenario, fold the test into a scenario's test, delete it, or, if it tests how the app or its test setup is built, move it to tests/e2e/${INTERNALS_DIR} (see docs/standards/testing-standard.md):`,
  );
  for (const { file, titlePath } of orphans) {
    console.error(`  ${[file, ...titlePath].join(' › ')}`);
  }
}

if (skipped.length > 0) {
  console.error(
    `Skipped ${skipped.length} active change(s) whose proposal is not written yet, so they have no delta specs: ${skipped.join(', ')}`,
  );
}

if (uncovered.length > 0 || orphans.length > 0) process.exit(1);

console.log(
  `All ${scenarios.length} spec scenarios have an E2E test, and all ${checked.length} E2E tests outside tests/e2e/${INTERNALS_DIR} cover a scenario.`,
);
