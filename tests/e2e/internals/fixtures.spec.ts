// An internals test (docs/standards/testing-standard.md): it checks the page
// error fixture in tests/e2e/fixtures.ts and the preview server's headers,
// which every E2E test relies on, not behaviour a visitor sees. No spec
// scenario covers it.

import {
  productionHeaders,
  readVercelConfig,
} from '../../support/previewHeaders';
import { expect, test, type Page, type SentryCarrier } from '../fixtures';

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

// Sends one item to the Sentry envelope endpoint, as the SDK would, without
// logging anything to the console.
async function reportToSentry(page: Page, header: object, payload: object) {
  const body = ['{}', JSON.stringify(header), JSON.stringify(payload)];
  await page.evaluate(
    (body) =>
      fetch('/api/1/envelope/?sentry_key=e2e', { method: 'POST', body }),
    body.join('\n'),
  );
}

// Proves the shared fixture does its job: the preview server sends the
// production headers, and a page error or a report to Sentry fails the test.
// In the test.fail() cases the expected failure counts as a pass, and the
// case would fail if the fixture let the error through.
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

  test('fails a test on an error reported only to Sentry', async ({ page }) => {
    test.fail();
    await page.goto('/');

    await reportToSentry(
      page,
      { type: 'event' },
      { message: 'reported on purpose' },
    );
  });

  test('fails a test on a Sentry report, even when the test routes the envelopes itself', async ({
    page,
  }) => {
    test.fail();
    await page.route('**/api/1/envelope/**', (route) =>
      route.fulfill({ status: 200, body: '{}' }),
    );
    await page.goto('/');

    await reportToSentry(
      page,
      { type: 'event' },
      { message: 'reported on purpose' },
    );
  });

  test('fails a test on an error log Sentry still buffers when the test ends', async ({
    page,
  }) => {
    test.fail();
    await page.goto('/');

    // Put the log straight into the SDK's buffer, where the SDK's own timer
    // never sends it, so only the fixture's flush at teardown can.
    await page.evaluate(() => {
      const carrier = (window as { __SENTRY__?: SentryCarrier }).__SENTRY__;
      const sdk = carrier?.[carrier.version];
      const client = sdk?.defaultCurrentScope?.getClient();
      if (!sdk || !client) {
        throw new Error('No Sentry client on the page.');
      }
      sdk.clientToLogBufferMap ??= new WeakMap();
      sdk.clientToLogBufferMap.set(client, [
        {
          timestamp: Date.now() / 1000,
          level: 'error',
          body: 'logged on purpose',
          trace_id: '0'.repeat(32),
          attributes: {},
        },
      ]);
    });
  });

  test('passes a test whose Sentry report is allowed', async ({
    page,
    allowSentryReports,
  }) => {
    allowSentryReports(/reported on purpose/);
    await page.goto('/');

    await reportToSentry(
      page,
      { type: 'event' },
      { message: 'reported on purpose' },
    );
    await reportToSentry(
      page,
      { type: 'log' },
      { items: [{ level: 'warn', body: 'warned on purpose' }] },
    );
  });

  test('passes a test whose error is allowed', async ({
    page,
    allowConsoleErrors,
  }) => {
    allowConsoleErrors(/logged on purpose/);
    await page.goto('/');

    await page.evaluate(() => console.error('logged on purpose'));
  });

  test('refuses a pattern with the g or y flag', ({
    allowConsoleErrors,
    allowSentryReports,
  }) => {
    expect(() => allowConsoleErrors(/status of 500/g)).toThrow(/g or y flag/);
    expect(() => allowConsoleErrors(/status of 500/y)).toThrow(/g or y flag/);
    expect(() => allowSentryReports(/players_sorted/g)).toThrow(/g or y flag/);
    expect(() => allowSentryReports(/players_sorted/y)).toThrow(/g or y flag/);
  });
});
