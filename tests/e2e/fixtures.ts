import { expect, test as base } from '@playwright/test';

export * from '@playwright/test';

type Fixtures = {
  /**
   * Allows console errors the test causes on purpose, such as the browser's
   * log of a request the test makes fail. Each pattern is matched against
   * the recorded error, which includes the request URL. A Content Security
   * Policy violation fails the test even when a pattern matches it.
   */
  allowConsoleErrors: (...patterns: RegExp[]) => void;
};

type Internal = {
  allowedConsoleErrors: RegExp[];
  acceptSentryEnvelopes: void;
  failOnPageErrors: void;
};

// How Chromium words a Content Security Policy violation in the console.
const CSP_VIOLATION = /Content Security Policy/;

// Every E2E spec imports `test` from here (docs/standards/testing-standard.md).
// A console error or an uncaught error in the page fails the test, and so
// does a Content Security Policy violation, which the browser logs as a
// console error.
export const test = base.extend<Fixtures & Internal>({
  // Playwright reads a fixture's dependencies from this object pattern, so it
  // must be there even when empty.
  // eslint-disable-next-line no-empty-pattern
  allowedConsoleErrors: async ({}, provide) => {
    await provide([]);
  },
  allowConsoleErrors: async ({ allowedConsoleErrors }, provide) => {
    await provide((...patterns) => {
      // A global or sticky pattern remembers where it last matched, so it
      // could match an error once and miss it the next time.
      const stateful = patterns.find(({ flags }) => /[gy]/.test(flags));
      if (stateful) {
        throw new Error(
          `allowConsoleErrors(${stateful}) uses the g or y flag; drop it.`,
        );
      }
      allowedConsoleErrors.push(...patterns);
    });
  },
  // The E2E Sentry DSN points at the preview server, which has no envelope
  // endpoint, so the browser would log a 404 for every report. A test that
  // asserts on the envelopes routes them itself, and its page route takes
  // precedence over this one.
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
    async ({ context, allowedConsoleErrors }, provide) => {
      const errors: string[] = [];
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

      const unexpected = errors.filter(
        (error) =>
          CSP_VIOLATION.test(error) ||
          !allowedConsoleErrors.some((allowed) => allowed.test(error)),
      );
      expect(unexpected, 'The page logged errors').toEqual([]);
    },
    { auto: true },
  ],
});
