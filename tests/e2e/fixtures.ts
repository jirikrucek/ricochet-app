import { expect, test as base } from '@playwright/test';

export * from '@playwright/test';

type Fixtures = {
  /**
   * Allows console errors the test causes on purpose, such as the browser's
   * log of a request the test makes fail. Each pattern is matched against
   * the recorded error, which includes the request URL. A pattern that would
   * also hide a Content Security Policy violation is refused.
   */
  allowConsoleErrors: (...patterns: RegExp[]) => void;
};

type Internal = {
  allowedConsoleErrors: RegExp[];
  acceptSentryEnvelopes: void;
  failOnPageErrors: void;
};

// How Chromium logs a Content Security Policy violation.
const CSP_VIOLATIONS = [
  `console error: Connecting to 'https://example.com/' violates the following Content Security Policy directive: "connect-src 'self'". The action has been blocked. (http://127.0.0.1:4173/assets/index.js)`,
  `console error: Fetch API cannot load https://example.com/. Refused to connect because it violates the document's Content Security Policy. (http://127.0.0.1:4173/assets/index.js)`,
];

// Every E2E spec imports `test` from here (docs/standards/testing-standard.md).
// A console error or an uncaught error in the page fails the test, so a
// Content Security Policy violation, which the browser logs as a console
// error, fails it too.
export const test = base.extend<Fixtures & Internal>({
  // Playwright reads a fixture's dependencies from this object pattern, so it
  // must be there even when empty.
  // eslint-disable-next-line no-empty-pattern
  allowedConsoleErrors: async ({}, provide) => {
    await provide([]);
  },
  allowConsoleErrors: async ({ allowedConsoleErrors }, provide) => {
    await provide((...patterns) => {
      for (const pattern of patterns) {
        if (CSP_VIOLATIONS.some((violation) => pattern.test(violation))) {
          throw new Error(
            `allowConsoleErrors(${pattern}) would also hide a Content Security Policy violation. Name the status and the request path instead.`,
          );
        }
      }
      allowedConsoleErrors.push(...patterns);
    });
  },
  // The E2E Sentry DSN points at the preview server, which has no envelope
  // endpoint, so the browser would log a 404 for every report. A test that
  // asserts on the envelopes routes them itself, and its page route takes
  // precedence over this one.
  acceptSentryEnvelopes: [
    async ({ context }, provide) => {
      await context.route('**/api/1/envelope/**', (route) =>
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
        (error) => !allowedConsoleErrors.some((allowed) => allowed.test(error)),
      );
      expect(unexpected, 'The page logged errors').toEqual([]);
    },
    { auto: true },
  ],
});
