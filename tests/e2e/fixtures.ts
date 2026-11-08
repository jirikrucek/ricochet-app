import { expect, test as base } from '@playwright/test';

export * from '@playwright/test';

type Fixtures = {
  /**
   * Allows console errors the test causes on purpose, such as the browser's
   * log of a request the test makes fail. Each pattern is matched against
   * the recorded error, which includes the request URL.
   */
  allowConsoleErrors: (...patterns: RegExp[]) => void;
};

type Internal = { allowedConsoleErrors: RegExp[]; failOnPageErrors: void };

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
    await provide((...patterns) => allowedConsoleErrors.push(...patterns));
  },
  failOnPageErrors: [
    async ({ context, allowedConsoleErrors }, provide) => {
      // The E2E Sentry DSN points at the preview server, which has no
      // envelope endpoint. Accept the envelopes here; a test that asserts on
      // them routes them itself, and its page route takes precedence.
      await context.route('**/api/1/envelope/**', (route) =>
        route.fulfill({ status: 200, body: '{}' }),
      );

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
