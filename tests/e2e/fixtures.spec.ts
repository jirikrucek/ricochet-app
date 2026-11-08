import { expect, test } from './fixtures';

// Proves the shared fixture fails a test on a page error. test.fail() turns
// the expected failure into a pass, and would fail if the fixture let the
// error through.

test.describe('The page error fixture', () => {
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

  test('fails a test on a Content Security Policy violation', async ({
    page,
  }) => {
    test.fail();
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

  test('refuses a pattern that would hide a policy violation', ({
    allowConsoleErrors,
  }) => {
    expect(() => allowConsoleErrors(/.*/)).toThrow(/Content Security Policy/);
  });
});
