import { expect, test } from '@playwright/test';

import {
  DESKTOP,
  chooseFilter,
  filterSelect,
  openOverview,
  shownNationalities,
  useUiLanguage,
} from './overview';

test.use({ viewport: DESKTOP });

test.beforeEach(async ({ page }) => {
  await useUiLanguage(page, 'en');
});

test.describe('Visitor can filter players by nationality', () => {
  test('Filtering by one nationality', async ({ page }) => {
    await openOverview(page);

    await chooseFilter(page, 'Nationality', 'Germany');

    await expect(page).toHaveURL(/[?&]nationality=DE/);
    await expect(filterSelect(page, 'Nationality')).toContainText('Germany');
    await expect
      .poll(async () => new Set(await shownNationalities(page)))
      .toEqual(new Set(['DE']));
  });

  test('Only nationalities present among players are offered', async ({
    page,
  }) => {
    // The seed has all six nationalities, so this state needs interception.
    await page.route('**/rest/v1/players*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            first_name: 'Alena',
            surname_prefix: null,
            surname: 'Testová',
            surname_suffix: null,
            nationality: 'CZ',
            sex: 'female',
          },
          {
            id: 2,
            first_name: 'Joost',
            surname_prefix: 'van',
            surname: 'Proef',
            surname_suffix: null,
            nationality: 'NL',
            sex: 'male',
          },
          {
            id: 3,
            first_name: 'Karel',
            surname_prefix: null,
            surname: 'Zkouška',
            surname_suffix: null,
            nationality: 'CZ',
            sex: 'male',
          },
        ]),
      }),
    );
    await openOverview(page);

    await filterSelect(page, 'Nationality').click();

    const options = page.getByRole('option');
    await expect(options).toHaveText(['All', 'Czechia', 'Netherlands']);
    await expect(options.nth(1).locator('img')).toHaveAttribute(
      'data-country',
      'CZ',
    );
    await expect(options.nth(2).locator('img')).toHaveAttribute(
      'data-country',
      'NL',
    );
  });

  test('Returning to all nationalities', async ({ page }) => {
    await openOverview(page, 'nationality=DE');
    await expect
      .poll(async () => new Set(await shownNationalities(page)))
      .toEqual(new Set(['DE']));

    await chooseFilter(page, 'Nationality', 'All');

    await expect(page).not.toHaveURL(/nationality=/);
    await expect
      .poll(async () => new Set(await shownNationalities(page)).size)
      .toBeGreaterThan(1);
  });
});

test.describe('Invalid URL values fall back to the defaults', () => {
  test('an unknown nationality code lists every nationality', async ({
    page,
  }) => {
    await openOverview(page, 'nationality=FR');

    await expect(filterSelect(page, 'Nationality')).toContainText('All');
    await expect
      .poll(async () => new Set(await shownNationalities(page)).size)
      .toBeGreaterThan(1);
  });
});
