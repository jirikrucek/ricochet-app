// The pure core of the scenario coverage check (docs/standards/testing-standard.md):
// which spec scenarios are in force once the active changes apply, and which
// of them no E2E test covers. checkScenarioCoverage.ts feeds it from the
// OpenSpec and Playwright CLIs.

export type Requirement = {
  name: string;
  scenarios: { name: string; rawText: string }[];
};

/** Requirements by spec id, e.g. `players/player-overview`. */
export type SpecRequirements = Map<string, Requirement[]>;

export type Delta =
  | {
      spec: string;
      operation: 'ADDED' | 'MODIFIED' | 'REMOVED';
      requirement: Requirement;
    }
  | {
      spec: string;
      operation: 'RENAMED';
      rename: { from: string; to: string };
    };

export type Scenario = {
  spec: string;
  requirement: string;
  name: string;
  /** Whether the scenario has an Examples table. */
  hasExamples: boolean;
};

// The order OpenSpec applies a delta spec in when it archives a change.
const operationOrder = ['RENAMED', 'REMOVED', 'MODIFIED', 'ADDED'] as const;

/** The specs as they will read once the deltas are archived into them. */
export function applyDeltas(
  specs: SpecRequirements,
  deltas: Delta[],
): SpecRequirements {
  const result: SpecRequirements = new Map(specs);

  for (const operation of operationOrder) {
    for (const delta of deltas) {
      if (delta.operation !== operation) continue;
      const requirements = result.get(delta.spec) ?? [];
      result.set(delta.spec, applyDelta(requirements, delta));
    }
  }

  return result;
}

function applyDelta(requirements: Requirement[], delta: Delta): Requirement[] {
  switch (delta.operation) {
    case 'RENAMED':
      return requirements.map((requirement) =>
        requirement.name === delta.rename.from
          ? { ...requirement, name: delta.rename.to }
          : requirement,
      );
    case 'REMOVED':
      return requirements.filter(({ name }) => name !== delta.requirement.name);
    case 'ADDED':
      return [
        ...requirements.filter(({ name }) => name !== delta.requirement.name),
        delta.requirement,
      ];
    case 'MODIFIED': {
      const index = requirements.findIndex(
        ({ name }) => name === delta.requirement.name,
      );
      // A modified requirement the spec lacks still needs its tests.
      if (index === -1) return [...requirements, delta.requirement];
      const modified = [...requirements];
      modified[index] = delta.requirement;
      return modified;
    }
  }
}

export function listScenarios(specs: SpecRequirements): Scenario[] {
  return [...specs].flatMap(([spec, requirements]) =>
    requirements.flatMap((requirement) =>
      requirement.scenarios.map(({ name, rawText }) => ({
        spec,
        requirement: requirement.name,
        name,
        hasExamples: /^Examples:/m.test(rawText),
      })),
    ),
  );
}

/** One E2E test, as Playwright lists it. */
export type E2eTest = {
  /** The spec file's path relative to `tests/e2e`, e.g. `players/listing.spec.ts`. */
  file: string;
  /** Its describe titles, then its own title. */
  titlePath: string[];
};

/**
 * Whether a test covers a scenario: its innermost describe block is titled
 * with the scenario's requirement name and its own title is the scenario
 * name. A scenario with an Examples table may instead have one test per
 * example, titled `<scenario name>: <example>`.
 */
function covers(scenario: Scenario, { titlePath }: E2eTest): boolean {
  const describe = titlePath.at(-2);
  const title = titlePath.at(-1) ?? '';
  return (
    describe === scenario.requirement &&
    (title === scenario.name ||
      (scenario.hasExamples && title.startsWith(`${scenario.name}: `)))
  );
}

/** Scenarios that no E2E test covers. */
export function uncoveredScenarios(
  scenarios: Scenario[],
  tests: E2eTest[],
): Scenario[] {
  return scenarios.filter(
    (scenario) => !tests.some((test) => covers(scenario, test)),
  );
}

/**
 * Where internals tests live, relative to `tests/e2e`: tests of how the app or
 * its test setup is built, which cover no spec scenario
 * (docs/standards/testing-standard.md).
 */
export const INTERNALS_DIR = 'internals/';

/** Whether a test is an internals test, so covers no scenario by design. */
export function isInternalsTest({ file }: E2eTest): boolean {
  return file.startsWith(INTERNALS_DIR);
}

/** E2E tests outside `tests/e2e/internals/` that cover no scenario. */
export function testsCoveringNoScenario(
  scenarios: Scenario[],
  tests: E2eTest[],
): E2eTest[] {
  return tests.filter(
    (test) =>
      !isInternalsTest(test) &&
      !scenarios.some((scenario) => covers(scenario, test)),
  );
}

/** The part of `openspec status --change <name> --json` this check reads. */
export type ChangeStatus = { artifacts: { id: string; status: string }[] };

/**
 * Whether a change's proposal is written. `openspec show` fails on a change
 * without one, and such a change has no delta specs yet. A status with no
 * proposal artifact at all throws: the OpenSpec CLI or schema has changed,
 * and skipping the change would leave its scenarios unchecked.
 */
export function isProposalDone({ artifacts }: ChangeStatus): boolean {
  const proposal = artifacts.find(({ id }) => id === 'proposal');
  if (!proposal) {
    const found = artifacts.map(({ id }) => id).join(', ') || 'none';
    throw new Error(
      `openspec status lists no proposal artifact (found: ${found}). Update isProposalDone in tests/support/scenarioCoverage.ts to the new schema.`,
    );
  }
  return proposal.status === 'done';
}
