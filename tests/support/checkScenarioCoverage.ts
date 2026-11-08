import { execFileSync } from 'node:child_process';
import path from 'node:path';

import {
  applyDeltas,
  isProposalDone,
  listScenarios,
  uncoveredScenarios,
  type ChangeStatus,
  type Delta,
  type E2eTest,
  type Requirement,
  type SpecRequirements,
} from './scenarioCoverage.ts';

// Fails when a spec scenario in force (the main specs with every active
// change applied) has no E2E test titled with its name, in a describe
// block titled with its requirement name
// (docs/standards/testing-standard.md). Lists the tests with
// `playwright test --list`, so it needs neither Supabase nor a browser.
// An active change whose proposal isn't written yet has no delta specs, so
// it is skipped, with a note on stderr.

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

function activeDeltas(): Delta[] {
  const { changes } = openspec<{ changes: { name: string }[] }>(
    'list',
    '--json',
  );
  return changes
    .filter(({ name }) => {
      const done = isProposalDone(
        openspec<ChangeStatus>('status', '--change', name, '--json'),
      );
      if (!done) {
        console.error(`Skipping change ${name}: its proposal is not done yet.`);
      }
      return done;
    })
    .flatMap(
      ({ name }) =>
        openspec<{ deltas: Delta[] }>(
          'show',
          name,
          '--type',
          'change',
          '--json',
          '--deltas-only',
        ).deltas,
    );
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

const scenarios = listScenarios(applyDeltas(mainSpecs(), activeDeltas()));
const uncovered = uncoveredScenarios(scenarios, e2eTests());

if (uncovered.length > 0) {
  console.error(
    `${uncovered.length} of ${scenarios.length} spec scenarios have no E2E test titled with the scenario name, in a describe block titled with the requirement name (see docs/standards/testing-standard.md):`,
  );
  for (const { spec, requirement, name } of uncovered) {
    console.error(`  ${spec} › ${requirement} › ${name}`);
  }
  process.exit(1);
}

console.log(`All ${scenarios.length} spec scenarios have an E2E test.`);
