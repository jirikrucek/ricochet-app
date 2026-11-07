import { expect, test } from '@playwright/test';

import {
  DESKTOP,
  NATIONALITIES_API,
  appliedFilters,
  clearAllFilters,
  filtersButton,
  openOverview,
  removeFilter,
  shownNationalities,
  useUiLanguage,
} from './overview';

test.use({ viewport: DESKTOP });

test.beforeEach(async ({ page }) => {
  await useUiLanguage(page, 'en');
});

test.describe('Applied filters are shown beside the filters button', () => {
  test('No filter applied', async ({ page }) => {
    await openOverview(page);

    await expect(filtersButton(page)).toHaveAccessibleName('Filters');
    await expect(appliedFilters(page)).toHaveCount(0);
  });

  test('Applied filters are visible with the panel closed', async ({
    page,
  }) => {
    await openOverview(page, 'nationality=CZ&sex=female');

    await expect(filtersButton(page)).toHaveAccessibleName('Filters 2');
    await expect(
      removeFilter(page, 'Czechia').locator('img[data-country="CZ"]'),
    ).toBeVisible();
    await expect(removeFilter(page, 'Czechia')).toContainText('Czechia');
    await expect(removeFilter(page, 'Female')).toContainText('Female');
  });

  test('Removing one applied filter', async ({ page }) => {
    await openOverview(page, 'nationality=CZ&sex=female');

    await removeFilter(page, 'Female').click();

    await expect(page).toHaveURL(/nationality=CZ/);
    await expect(page).not.toHaveURL(/sex=/);
    await expect(filtersButton(page)).toHaveAccessibleName('Filters 1');
    await expect(appliedFilters(page).getByRole('link')).toHaveCount(1);
    await expect(removeFilter(page, 'Czechia')).toBeVisible();
    await expect
      .poll(async () => new Set(await shownNationalities(page)))
      .toEqual(new Set(['CZ']));
  });
});

test.describe('Clear all filters removes every applied filter at once', () => {
  test('Clear all filters is offered with one applied filter', async ({
    page,
  }) => {
    await openOverview(page, 'sex=female');

    await expect(clearAllFilters(page)).toBeVisible();
  });

  test('Clear all filters is not shown without applied filters', async ({
    page,
  }) => {
    await openOverview(page);

    await expect(clearAllFilters(page)).toHaveCount(0);
  });

  test('Clearing all applied filters', async ({ page }) => {
    await openOverview(page, 'nationality=CZ&sex=female');

    await clearAllFilters(page).click();

    await expect(page).toHaveURL(/\/players$/);
    await expect(appliedFilters(page)).toHaveCount(0);
    await expect
      .poll(async () => new Set(await shownNationalities(page)).size)
      .toBeGreaterThan(1);
  });
});

test.describe('An applied nationality that no player has', () => {
  test('stays named and removable', async ({ page }) => {
    // The seed has all six nationalities, so this state needs interception.
    await page.route(NATIONALITIES_API, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ nationality: 'NL' }, { nationality: 'CZ' }]),
      }),
    );

    await openOverview(page, 'nationality=GB');

    await expect(filtersButton(page)).toHaveAccessibleName('Filters 1');
    await expect(removeFilter(page, 'United Kingdom')).toBeVisible();
    await expect(clearAllFilters(page)).toBeVisible();
  });
});
