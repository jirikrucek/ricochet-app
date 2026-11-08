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
  const result: SpecRequirements = new Map(
    [...specs].map(([spec, requirements]) => [spec, [...requirements]]),
  );

  for (const operation of operationOrder) {
    for (const delta of deltas) {
      if (delta.operation !== operation) continue;
      const requirements = result.get(delta.spec) ?? [];
      result.set(delta.spec, applyDelta(requirements, delta));
    }
  }

  return result;
}

function applyDelta(requirements: Requirement[], delta: Delta) {
  if (delta.operation === 'RENAMED') {
    return requirements.map((requirement) =>
      requirement.name === delta.rename.from
        ? { ...requirement, name: delta.rename.to }
        : requirement,
    );
  }

  const { name } = delta.requirement;
  const others = requirements.filter(
    (requirement) => requirement.name !== name,
  );

  if (delta.operation === 'REMOVED') return others;
  if (delta.operation === 'ADDED') return [...others, delta.requirement];

  return requirements.some((requirement) => requirement.name === name)
    ? requirements.map((requirement) =>
        requirement.name === name ? delta.requirement : requirement,
      )
    : [...requirements, delta.requirement];
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

/**
 * Scenarios with no E2E test. A test covers a scenario when its innermost
 * describe block is titled with the scenario's requirement name and its own
 * title is the scenario name. A scenario with an Examples table may instead
 * have one test per example, titled `<scenario name>: <example>`.
 *
 * @param titlePaths one entry per test: its describe titles, then its own title
 */
export function uncoveredScenarios(
  scenarios: Scenario[],
  titlePaths: string[][],
): Scenario[] {
  const tests = titlePaths.map((titlePath) => ({
    describe: titlePath.at(-2),
    title: titlePath.at(-1) ?? '',
  }));
  const covers = (scenario: Scenario) =>
    tests.some(
      ({ describe, title }) =>
        describe === scenario.requirement &&
        (title === scenario.name ||
          (scenario.hasExamples && title.startsWith(`${scenario.name}: `))),
    );

  return scenarios.filter((scenario) => !covers(scenario));
}
