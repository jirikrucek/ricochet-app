import { expect, test as base, type Page } from '@playwright/test';

import { sentryErrorReports } from '../support/sentryEnvelope';

export * from '@playwright/test';

type Fixtures = {
  /**
   * Allows console errors the test causes on purpose, such as the browser's
   * log of a request the test makes fail. Each pattern is matched against
   * the recorded error, which includes the request URL. A Content Security
   * Policy violation fails the test even when a pattern matches it.
   */
  allowConsoleErrors: (...patterns: RegExp[]) => void;
  /**
   * Allows reports to Sentry the test causes on purpose, such as the event
   * for a query the test makes fail. Each pattern is matched against the
   * report as JSON: an event without its breadcrumbs, or one log entry.
   */
  allowSentryReports: (...patterns: RegExp[]) => void;
};

type Internal = {
  allowedConsoleErrors: RegExp[];
  allowedSentryReports: RegExp[];
  acceptSentryEnvelopes: void;
  failOnPageErrors: void;
};

// How Chromium words a Content Security Policy violation in the console.
const CSP_VIOLATION = /Content Security Policy/;

// How long teardown waits for the Sentry SDK to send what it buffered.
const SENTRY_FLUSH_TIMEOUT = 2_000;

// A global or sticky pattern remembers where it last matched, so it could
// match an error once and miss it the next time.
function refuseStatefulPatterns(fixture: string, patterns: RegExp[]) {
  const stateful = patterns.find(({ flags }) => /[gy]/.test(flags));
  if (stateful) {
    throw new Error(`${fixture}(${stateful}) uses the g or y flag; drop it.`);
  }
}

/**
 * The part of the Sentry SDK's global carrier the fixtures reach into. The SDK
 * keeps its state there, keyed by its version, on `window.__SENTRY__`.
 */
export type SentryCarrier = { version: string } & Record<
  string,
  {
    defaultCurrentScope?: {
      getClient(): { flush(timeout: number): Promise<boolean> } | undefined;
    };
    clientToLogBufferMap?: WeakMap<object, object[]>;
  }
>;

// The SDK sends error events at once, but buffers logs for up to 5 s and
// sends them when the page is hidden. Teardown flushes each open page of the
// app through the client the SDK keeps on its global carrier. The flush
// resolves once every envelope got its response, so the fixture has seen them
// all. Returns what went wrong, if anything, so the failure lists it next to
// the errors the test collected.
async function flushSentry(
  page: Page,
  appOrigin: string,
): Promise<string | undefined> {
  if (!isFromApp(page.url(), appOrigin)) {
    return;
  }
  let flushed: boolean | undefined;
  try {
    // A test can end on a click that is still navigating, and evaluating then
    // would fail on the page being replaced. The navigation may leave the app.
    await page.waitForLoadState();
    if (!isFromApp(page.url(), appOrigin)) {
      return;
    }
    flushed = await page.evaluate(async (timeout) => {
      const carrier = (window as { __SENTRY__?: SentryCarrier }).__SENTRY__;
      const client =
        carrier?.[carrier.version]?.defaultCurrentScope?.getClient();
      return client ? client.flush(timeout) : undefined;
    }, SENTRY_FLUSH_TIMEOUT);
  } catch (error) {
    return `Sentry flush failed on ${page.url()}: ${(error as Error).message}`;
  }
  if (flushed === undefined) {
    return `No Sentry client on ${page.url()} to flush: the app didn't start Sentry, or a Sentry SDK upgrade moved its global carrier.`;
  }
  if (!flushed) {
    return `Sentry didn't send its buffered reports within ${SENTRY_FLUSH_TIMEOUT} ms on ${page.url()}.`;
  }
}

function isFromApp(url: string, appOrigin: string) {
  return URL.canParse(url) && new URL(url).origin === appOrigin;
}

function isSentryEnvelope(url: string, appOrigin: string) {
  return (
    isFromApp(url, appOrigin) &&
    new URL(url).pathname.startsWith('/api/1/envelope/')
  );
}

// The error reports in the envelopes, as failure lines, minus the allowed
// ones. An envelope that can't be read is a failure line too.
function unexpectedSentryReports(envelopes: string[], allowed: RegExp[]) {
  return envelopes.flatMap((envelope) => {
    try {
      return sentryErrorReports(envelope)
        .filter(({ json }) => !allowed.some((pattern) => pattern.test(json)))
        .map(({ summary }) => summary);
    } catch (error) {
      return [`Unreadable Sentry envelope: ${(error as Error).message}`];
    }
  });
}

// Every E2E spec imports `test` from here (docs/standards/testing-standard.md).
// A console error, an uncaught error or a report to Sentry fails the test,
// and so does a Content Security Policy violation, which the browser logs as
// a console error.
export const test = base.extend<Fixtures & Internal>({
  // Playwright reads a fixture's dependencies from this object pattern, so it
  // must be there even when empty.
  // eslint-disable-next-line no-empty-pattern
  allowedConsoleErrors: async ({}, provide) => {
    await provide([]);
  },
  allowConsoleErrors: async ({ allowedConsoleErrors }, provide) => {
    await provide((...patterns) => {
      refuseStatefulPatterns('allowConsoleErrors', patterns);
      allowedConsoleErrors.push(...patterns);
    });
  },
  // eslint-disable-next-line no-empty-pattern
  allowedSentryReports: async ({}, provide) => {
    await provide([]);
  },
  allowSentryReports: async ({ allowedSentryReports }, provide) => {
    await provide((...patterns) => {
      refuseStatefulPatterns('allowSentryReports', patterns);
      allowedSentryReports.push(...patterns);
    });
  },
  // The E2E Sentry DSN points at the preview server, which has no envelope
  // endpoint, so the browser would log a 404 for every report. A test that
  // asserts on the envelopes routes them itself, and its page route takes
  // precedence over this one. Either way, failOnPageErrors sees each report.
  acceptSentryEnvelopes: [
    async ({ context, baseURL }, provide) => {
      await context.route(`${baseURL}/api/1/envelope/**`, (route) =>
        route.fulfill({ status: 200, body: '{}' }),
      );
      await provide();
    },
    { auto: true },
  ],
  failOnPageErrors: [
    async (
      { context, baseURL, allowedConsoleErrors, allowedSentryReports },
      provide,
    ) => {
      if (!baseURL) {
        throw new Error('The page error fixture needs baseURL in the config.');
      }
      const appOrigin = new URL(baseURL).origin;
      const errors: string[] = [];
      // What kept the fixture from checking the reports. No pattern allows it.
      const problems: string[] = [];
      // Watching requests, not routing them, sees the envelopes a test
      // routes itself too.
      const envelopes: string[] = [];
      context.on('request', (request) => {
        if (
          request.method() === 'POST' &&
          isSentryEnvelope(request.url(), appOrigin)
        ) {
          const body = request.postData();
          if (body === null) {
            problems.push(`Sentry envelope without a body (${request.url()})`);
          } else {
            envelopes.push(body);
          }
        }
      });
      context.on('console', (message) => {
        if (message.type() === 'error') {
          const { url } = message.location();
          errors.push(
            `console error: ${message.text()}${url ? ` (${url})` : ''}`,
          );
        }
      });
      context.on('weberror', (error) => {
        errors.push(`uncaught error: ${error.error().message}`);
      });

      await provide();

      for (const page of context.pages()) {
        const problem = await flushSentry(page, appOrigin);
        if (problem) {
          problems.push(problem);
        }
      }
      const unexpectedErrors = errors.filter(
        (error) =>
          CSP_VIOLATION.test(error) ||
          !allowedConsoleErrors.some((allowed) => allowed.test(error)),
      );
      const unexpectedReports = unexpectedSentryReports(
        envelopes,
        allowedSentryReports,
      );
      expect(
        [...problems, ...unexpectedErrors, ...unexpectedReports],
        'The page logged or reported errors',
      ).toEqual([]);
    },
    { auto: true },
  ],
});
