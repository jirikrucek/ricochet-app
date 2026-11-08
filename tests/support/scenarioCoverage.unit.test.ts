import { describe, expect, it } from 'vitest';

import {
  applyDeltas,
  isProposalDone,
  listScenarios,
  testsCoveringNoScenario,
  uncoveredScenarios,
  type ChangeStatus,
  type E2eTest,
  type Requirement,
  type SpecRequirements,
} from './scenarioCoverage';

function requirement(name: string, ...scenarios: string[]): Requirement {
  return {
    name,
    scenarios: scenarios.map((scenario) => ({ name: scenario, rawText: '' })),
  };
}

function names(specs: SpecRequirements) {
  return listScenarios(specs).map(
    ({ spec, requirement, name }) => `${spec} › ${requirement} › ${name}`,
  );
}

const mainSpecs: SpecRequirements = new Map([
  [
    'app/branding',
    [
      requirement('Logo is shown', 'Logo on the home page'),
      requirement('Logo links home', 'Returning home'),
    ],
  ],
]);

describe('applyDeltas', () => {
  it('keeps the main specs when there are no deltas', () => {
    expect(names(applyDeltas(mainSpecs, []))).toEqual([
      'app/branding › Logo is shown › Logo on the home page',
      'app/branding › Logo links home › Returning home',
    ]);
  });

  it('adds an ADDED requirement, also to a spec that does not exist yet', () => {
    const specs = applyDeltas(mainSpecs, [
      {
        spec: 'app/branding',
        operation: 'ADDED',
        requirement: requirement('Favicon is shown', 'Favicon in the tab'),
      },
      {
        spec: 'app/footer',
        operation: 'ADDED',
        requirement: requirement('Footer is shown', 'Footer on every page'),
      },
    ]);

    expect(names(specs)).toEqual([
      'app/branding › Logo is shown › Logo on the home page',
      'app/branding › Logo links home › Returning home',
      'app/branding › Favicon is shown › Favicon in the tab',
      'app/footer › Footer is shown › Footer on every page',
    ]);
  });

  it('replaces a MODIFIED requirement with its new scenarios', () => {
    const specs = applyDeltas(mainSpecs, [
      {
        spec: 'app/branding',
        operation: 'MODIFIED',
        requirement: requirement('Logo is shown', 'Logo on a phone'),
      },
    ]);

    expect(names(specs)).toEqual([
      'app/branding › Logo is shown › Logo on a phone',
      'app/branding › Logo links home › Returning home',
    ]);
  });

  it('adds a MODIFIED requirement the spec lacks, so its scenarios still count', () => {
    const specs = applyDeltas(mainSpecs, [
      {
        spec: 'app/branding',
        operation: 'MODIFIED',
        requirement: requirement('Favicon is shown', 'Favicon in the tab'),
      },
    ]);

    expect(names(specs)).toEqual([
      'app/branding › Logo is shown › Logo on the home page',
      'app/branding › Logo links home › Returning home',
      'app/branding › Favicon is shown › Favicon in the tab',
    ]);
  });

  it('drops a REMOVED requirement and its scenarios', () => {
    const specs = applyDeltas(mainSpecs, [
      {
        spec: 'app/branding',
        operation: 'REMOVED',
        requirement: requirement('Logo links home'),
      },
    ]);

    expect(names(specs)).toEqual([
      'app/branding › Logo is shown › Logo on the home page',
    ]);
  });

  it('applies RENAMED before MODIFIED, so a modification can use the new name', () => {
    const specs = applyDeltas(mainSpecs, [
      {
        spec: 'app/branding',
        operation: 'MODIFIED',
        requirement: requirement('Logo takes you home', 'Going home'),
      },
      {
        spec: 'app/branding',
        operation: 'RENAMED',
        rename: { from: 'Logo links home', to: 'Logo takes you home' },
      },
    ]);

    expect(names(specs)).toEqual([
      'app/branding › Logo is shown › Logo on the home page',
      'app/branding › Logo takes you home › Going home',
    ]);
  });

  it('leaves the main specs it was given unchanged', () => {
    applyDeltas(mainSpecs, [
      {
        spec: 'app/branding',
        operation: 'REMOVED',
        requirement: requirement('Logo is shown'),
      },
    ]);

    expect(names(mainSpecs)).toHaveLength(2);
  });
});

// One requirement with a plain scenario and one with an Examples table,
// shared by both directions so they can be compared.
const translated = 'Player overview is translated';
const scenarios = listScenarios(
  new Map([
    [
      'players/player-overview',
      [
        {
          name: translated,
          scenarios: [
            { name: 'Sex labels are translated', rawText: '- **THEN** …' },
            {
              name: 'Page text follows the UI language',
              rawText: '- **THEN** …\n\nExamples:\n\n| language |',
            },
          ],
        },
      ],
    ],
  ]),
);

function e2eTest(file: string, ...titlePath: string[]): E2eTest {
  return { file, titlePath };
}

describe('uncoveredScenarios', () => {
  function uncovered(...titlePaths: string[][]) {
    const tests = titlePaths.map((titlePath) =>
      e2eTest('players/translations.spec.ts', ...titlePath),
    );
    return uncoveredScenarios(scenarios, tests).map(({ name }) => name);
  }

  it('reports every scenario when there are no tests', () => {
    expect(uncovered()).toEqual([
      'Sex labels are translated',
      'Page text follows the UI language',
    ]);
  });

  it('counts a test titled with the scenario name in a describe titled with its requirement', () => {
    expect(uncovered([translated, 'Sex labels are translated'])).not.toContain(
      'Sex labels are translated',
    );
  });

  it('counts the innermost describe only', () => {
    expect(
      uncovered(['On a phone', translated, 'Sex labels are translated']),
    ).not.toContain('Sex labels are translated');
    expect(
      uncovered([translated, 'On a phone', 'Sex labels are translated']),
    ).toContain('Sex labels are translated');
  });

  it('does not count a scenario test outside its requirement describe', () => {
    expect(uncovered(['Sex labels are translated'])).toContain(
      'Sex labels are translated',
    );
    expect(uncovered(['Sex filter', 'Sex labels are translated'])).toContain(
      'Sex labels are translated',
    );
  });

  it('counts a test per example of a scenario with examples', () => {
    expect(
      uncovered([translated, 'Page text follows the UI language: Czech']),
    ).not.toContain('Page text follows the UI language');
  });

  it('does not count a test per example without the colon', () => {
    expect(
      uncovered([translated, 'Page text follows the UI language in Czech']),
    ).toContain('Page text follows the UI language');
  });

  it('does not count a test per example of a scenario without examples', () => {
    expect(
      uncovered([translated, 'Sex labels are translated: Czech']),
    ).toContain('Sex labels are translated');
  });

  it('does not count a describe titled with the scenario name', () => {
    expect(
      uncovered([translated, 'Sex labels are translated', 'On a phone']),
    ).toContain('Sex labels are translated');
  });

  it('does not count a title that only starts with the scenario name', () => {
    expect(
      uncovered([translated, 'Sex labels are translated on a phone']),
    ).toContain('Sex labels are translated');
  });
});

describe('testsCoveringNoScenario', () => {
  function orphans(...tests: E2eTest[]) {
    return testsCoveringNoScenario(scenarios, tests).map(
      ({ file, titlePath }) => [file, ...titlePath].join(' › '),
    );
  }

  it('reports a test that covers no scenario', () => {
    expect(
      orphans(e2eTest('app/routes.spec.ts', 'shows the Players page heading')),
    ).toEqual(['app/routes.spec.ts › shows the Players page heading']);
  });

  it('does not report a test that covers a scenario', () => {
    expect(
      orphans(
        e2eTest(
          'players/translations.spec.ts',
          translated,
          'Sex labels are translated',
        ),
      ),
    ).toEqual([]);
  });

  it('does not report a test for one example of a scenario with examples', () => {
    expect(
      orphans(
        e2eTest(
          'players/translations.spec.ts',
          translated,
          'Page text follows the UI language: Czech',
        ),
      ),
    ).toEqual([]);
  });

  it('skips a test in tests/e2e/internals/, even though it covers no scenario', () => {
    expect(
      orphans(
        e2eTest(
          'internals/sheet.spec.ts',
          'Sheet width',
          'Menu keeps its own width',
        ),
      ),
    ).toEqual([]);
  });

  it('does not skip a folder whose name only starts with internals', () => {
    expect(
      orphans(e2eTest('internals-legacy/listing.spec.ts', 'lists players')),
    ).toEqual(['internals-legacy/listing.spec.ts › lists players']);
  });

  it('does not skip a file that only has internals elsewhere in its path', () => {
    expect(
      orphans(e2eTest('players/internals/listing.spec.ts', 'lists players')),
    ).toEqual(['players/internals/listing.spec.ts › lists players']);
  });

  it('agrees with uncoveredScenarios on which test covers which scenario', () => {
    const tests = [
      e2eTest(
        'players/translations.spec.ts',
        translated,
        'Sex labels are translated',
      ),
      e2eTest(
        'players/translations.spec.ts',
        'Page text follows the UI language',
      ),
    ];

    expect(
      uncoveredScenarios(scenarios, tests).map(({ name }) => name),
    ).toEqual(['Page text follows the UI language']);
    expect(orphans(...tests)).toEqual([
      'players/translations.spec.ts › Page text follows the UI language',
    ]);
  });
});

describe('isProposalDone', () => {
  function status(proposalStatus: string, specsStatus = 'ready'): ChangeStatus {
    return {
      artifacts: [
        { id: 'proposal', status: proposalStatus },
        { id: 'specs', status: specsStatus },
      ],
    };
  }

  it('is true once the proposal is done', () => {
    expect(isProposalDone(status('done'))).toBe(true);
  });

  it('is false while the proposal is still to be written', () => {
    expect(isProposalDone(status('ready'))).toBe(false);
  });

  it('is false while the proposal is not done, even if another artifact is', () => {
    expect(isProposalDone(status('ready', 'done'))).toBe(false);
  });

  it('throws for a status with no proposal artifact, rather than skip the change', () => {
    expect(() =>
      isProposalDone({ artifacts: [{ id: 'specs', status: 'done' }] }),
    ).toThrow(/no proposal artifact \(found: specs\)/);
    expect(() => isProposalDone({ artifacts: [] })).toThrow(/found: none/);
  });
});
