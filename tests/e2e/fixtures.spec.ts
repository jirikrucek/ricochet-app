import { productionHeaders, readVercelConfig } from '../support/previewHeaders';
import { expect, test } from './fixtures';

type Directives = Map<string, string[]>;

function directives(policy: string | undefined): Directives {
  return new Map(
    (policy ?? '')
      .split(';')
      .map((directive) => directive.trim().split(/\s+/))
      .filter(([name]) => name)
      .map(([name, ...sources]) => [name, sources]),
  );
}

// Proves the shared fixture does its job: the preview server sends the
// production headers, and a page error fails the test. In the test.fail()
// cases the expected failure counts as a pass, and the case would fail if
// the fixture let the error through.
test.describe('The page error fixture', () => {
  test('runs under the production headers', async ({ page }) => {
    const response = await page.goto('/');
    const served = response?.headers() ?? {};

    const production = Object.entries(productionHeaders(readVercelConfig()));
    expect(production.length).toBeGreaterThan(0);
    for (const [key, value] of production) {
      const sent = served[key.toLowerCase()];
      if (key !== 'Content-Security-Policy') {
        expect(sent, key).toBe(value);
        continue;
      }
      // The preview server may only append a local Supabase origin to a
      // directive's sources.
      const policy = directives(sent);
      for (const [name, sources] of directives(value)) {
        expect(policy.get(name)?.slice(0, sources.length), name).toEqual(
          sources,
        );
      }
    }
  });

  test('fails a test on a console error', async ({ page }) => {
    test.fail();
    await page.goto('/');

    await page.evaluate(() => console.error('logged on purpose'));
  });

  test('fails a test on an uncaught error', async ({ page }) => {
    test.fail();
    await page.goto('/');

    await page.evaluate(() => {
      setTimeout(() => {
        throw new Error('thrown on purpose');
      });
    });
    // Let the timer fire before the test ends.
    await page.evaluate(
      () => new Promise((resolve) => setTimeout(resolve, 50)),
    );
  });

  test('fails a test on a Content Security Policy violation, even when every error is allowed', async ({
    page,
    allowConsoleErrors,
  }) => {
    test.fail();
    // Without the policy, the request would still fail, on CORS or on the
    // network. Allowing every error leaves the violation as the only one
    // that can fail this test.
    allowConsoleErrors(/.*/);
    await page.goto('/');

    // The policy blocks the request before it leaves the browser, so the
    // test needs no internet.
    await page.evaluate(() => fetch('https://example.com/').catch(() => {}));
  });

  test('passes a test whose error is allowed', async ({
    page,
    allowConsoleErrors,
  }) => {
    allowConsoleErrors(/logged on purpose/);
    await page.goto('/');

    await page.evaluate(() => console.error('logged on purpose'));
  });

  test('refuses a pattern with the g or y flag', ({ allowConsoleErrors }) => {
    expect(() => allowConsoleErrors(/status of 500/g)).toThrow(/g or y flag/);
    expect(() => allowConsoleErrors(/status of 500/y)).toThrow(/g or y flag/);
  });
});
