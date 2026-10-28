import { expect, test, type Page, type Request } from '@playwright/test';

import {
  DESKTOP,
  expectPlayersListed,
  openOverview,
  playersTable,
} from './overview';

// The seed can't produce these states, so these tests intercept the players
// request (docs/standards/testing-standard.md).
const PLAYERS_API = '**/rest/v1/players*';

// TanStack Query retries a failed query 3 times with backoff (about 7 s)
// before showing the error state.
const ERROR_STATE_TIMEOUT = 20_000;

test.use({ viewport: DESKTOP });

function failPlayersRequests(page: Page) {
  return page.route(PLAYERS_API, (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Internal Server Error' }),
    }),
  );
}

function sentryEnvelopes(page: Page) {
  const envelopes: Request[] = [];
  return page
    .route('**/api/1/envelope/**', (route) => {
      envelopes.push(route.request());
      return route.fulfill({ status: 200, body: '{}' });
    })
    .then(() => envelopes);
}

test.describe('Player overview shows loading, error, and empty states', () => {
  test('Loading', async ({ page }) => {
    let release: () => void = () => {};
    const held = new Promise<void>((resolve) => (release = resolve));
    await page.route(PLAYERS_API, async (route) => {
      await held;
      await route.fallback();
    });

    await openOverview(page);

    await expect(
      page.getByRole('status', { name: 'Loading players' }),
    ).toBeVisible();
    await expect(playersTable(page)).toHaveCount(0);
    release();
    await expectPlayersListed(page);
  });

  test('Fetching fails', async ({ page }) => {
    const envelopes = await sentryEnvelopes(page);
    await failPlayersRequests(page);

    await openOverview(page);

    const alert = page.getByRole('alert');
    await expect(alert).toContainText("Players couldn't be loaded.", {
      timeout: ERROR_STATE_TIMEOUT,
    });
    await expect(alert.getByRole('button', { name: 'Retry' })).toBeVisible();
    await expect
      .poll(() =>
        envelopes.some((request) => {
          const body = request.postData() ?? '';
          return body.includes('"type":"event"') && body.includes('"players"');
        }),
      )
      .toBe(true);
  });

  test('Retry after a failure', async ({ page }) => {
    await failPlayersRequests(page);
    await openOverview(page);
    const retry = page
      .getByRole('alert')
      .getByRole('button', { name: 'Retry' });
    await expect(retry).toBeVisible({ timeout: ERROR_STATE_TIMEOUT });

    await page.unroute(PLAYERS_API);
    await retry.click();

    await expectPlayersListed(page);
    await expect(page.getByRole('alert')).toHaveCount(0);
  });

  test('No players exist', async ({ page }) => {
    await page.route(PLAYERS_API, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '[]',
      }),
    );

    await openOverview(page);

    await expect(page.getByText('No players yet')).toBeVisible();
    await expect(playersTable(page)).toHaveCount(0);
    await expect(
      page.getByRole('navigation', { name: 'Pagination' }),
    ).toHaveCount(0);
    await expect(page.getByText(/^Showing /)).toHaveCount(0);
  });
});
