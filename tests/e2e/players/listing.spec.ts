import { expect, test } from '@playwright/test';

import {
  DESKTOP,
  SMALL_PHONE,
  bodyRows,
  expectNoHorizontalOverflow,
  expectPlayersListed,
  localSupabase,
  openOverview,
  playersTable,
  rowFor,
  shownSurnames,
} from './overview';

test.use({ viewport: DESKTOP });

test.describe('Player overview lists every player in a table', () => {
  test('Players shown with surname, first name, and nationality', async ({
    page,
  }) => {
    await openOverview(page, 'nationality=CZ&pageSize=50');

    const table = playersTable(page);
    await expect(table.getByRole('columnheader')).toHaveText([
      'Surname',
      'First name',
      'Nationality',
    ]);
    const row = rowFor(page, 'Nováková', 'Jana');
    await expect(row).toHaveCount(1);
    await expect(row.locator('img')).toHaveAttribute('data-country', 'CZ');
  });

  test('Surname shown with its prefix and suffix', async ({ page }) => {
    await openOverview(page, 'pageSize=50&sort=desc');
    await expect(rowFor(page, 'de Vries', 'Pieter')).toHaveCount(1);

    await openOverview(page, 'nationality=CZ&pageSize=50');
    await expect(rowFor(page, 'Kovář jr.', 'Tomáš')).toHaveCount(1);
  });

  test('Table kept on a phone', async ({ page }) => {
    await openOverview(page, '', SMALL_PHONE);

    await expectPlayersListed(page);
    await expect(playersTable(page)).toBeVisible();
    await expect(playersTable(page).getByRole('columnheader')).toHaveText([
      'Surname',
      'First name',
      'Nationality',
    ]);
    await expectNoHorizontalOverflow(page);
  });
});

test.describe('Player data is public and read-only', () => {
  test('Anonymous visitor reads players', async ({ page }) => {
    await openOverview(page);

    await expectPlayersListed(page);
    expect(await bodyRows(page).count()).toBeGreaterThan(0);
    const authKeys = await page.evaluate(() =>
      Object.keys(localStorage).filter((key) => key.includes('auth-token')),
    );
    expect(authKeys).toEqual([]);
  });

  test('Visitor cannot change player data', async ({ page, request }) => {
    const { playersUrl, headers } = localSupabase();
    await openOverview(page);
    const before = await shownSurnames(page);
    const first = await request.get(
      `${playersUrl}?select=id&order=id&limit=1`,
      {
        headers,
      },
    );
    const [{ id }] = (await first.json()) as { id: number }[];

    const insert = await request.post(playersUrl, {
      headers,
      data: {
        first_name: 'Intruder',
        surname: 'Aaron',
        nationality: 'CZ',
        sex: 'male',
      },
    });
    const update = await request.patch(`${playersUrl}?id=eq.${id}`, {
      headers,
      data: { surname: 'Aaaaa' },
    });
    const remove = await request.delete(`${playersUrl}?id=eq.${id}`, {
      headers,
    });

    for (const response of [insert, update, remove]) {
      expect(response.status()).toBeGreaterThanOrEqual(400);
    }
    await page.reload();
    expect(await shownSurnames(page)).toEqual(before);
  });
});
