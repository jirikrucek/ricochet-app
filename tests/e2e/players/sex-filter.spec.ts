import { expect, test } from '@playwright/test';

import {
  DESKTOP,
  asNameSet,
  chooseFilter,
  expectPlayersListed,
  filterSelect,
  openOverview,
  playersAcrossPages,
  playersTable,
  seededPlayers,
  useUiLanguage,
  chooseFilters,
  expectFilterValue,
  openFiltersPanel,
  appliedFilters,
  clearAllFilters,
  filtersButton,
  removeFilter,
} from './overview';

test.use({ viewport: DESKTOP });

test.beforeEach(async ({ page }) => {
  await useUiLanguage(page, 'en');
});

test.describe('Visitor can filter players by sex', () => {
  test('Filtering by sex', async ({ page, request }) => {
    await openOverview(page);

    await chooseFilter(page, 'Sex', 'Female');

    await expect(page).toHaveURL(/[?&]sex=female/);
    const shown = await playersAcrossPages(page, 'sex=female');
    expect(asNameSet(shown)).toEqual(
      asNameSet(await seededPlayers(request, { sex: 'female' })),
    );
  });

  test('Sex labels follow the current UI language', async ({ page }) => {
    await useUiLanguage(page, 'de');
    await openOverview(page);

    await openFiltersPanel(page, 'Filter');
    await filterSelect(page, 'Geschlecht').click();

    await expect(page.getByRole('option')).toHaveText([
      'Alle',
      'Männlich',
      'Weiblich',
    ]);
  });
});

test.describe('Filters combine with AND', () => {
  test('Both filters applied together', async ({ page, request }) => {
    await openOverview(page);

    await chooseFilters(page, { Nationality: 'Poland', Sex: 'Male' });

    await expect(page).toHaveURL(/nationality=PL/);
    await expect(page).toHaveURL(/sex=male/);
    const shown = await playersAcrossPages(page, 'nationality=PL&sex=male');
    expect(asNameSet(shown)).toEqual(
      asNameSet(
        await seededPlayers(request, { nationality: 'PL', sex: 'male' }),
      ),
    );
  });
});

test.describe('Player overview shows loading, error, and empty states', () => {
  test('No players match the filters', async ({ page }) => {
    await openOverview(page);

    await chooseFilter(page, 'Nationality', 'United Kingdom');
    await chooseFilter(page, 'Sex', 'Female');

    await expect(
      page.getByText('No players match the selected filters'),
    ).toBeVisible();
    await expect(removeFilter(page, 'United Kingdom')).toBeVisible();
    await expect(removeFilter(page, 'Female')).toBeVisible();
    await expect(clearAllFilters(page)).toBeVisible();
    await expect(playersTable(page)).toHaveCount(0);
  });

  test('Clearing filters from the no-match state', async ({ page }) => {
    await openOverview(page, 'nationality=GB&sex=female');

    await clearAllFilters(page).click();

    await expect(filtersButton(page)).toHaveAccessibleName('Filters');
    await expect(appliedFilters(page)).toHaveCount(0);
    await expectPlayersListed(page);
    await expect(page).toHaveURL(/\/players$/);
  });
});

test.describe('The view is kept in the URL', () => {
  test('Reload keeps the view', async ({ page }) => {
    await openOverview(page);
    await chooseFilter(page, 'Sex', 'Male');
    await expect(page).toHaveURL(/[?&]sex=male/);

    await page.reload();

    await expectFilterValue(page, 'Sex', 'Male');
    await expect(page).toHaveURL(/[?&]sex=male/);
  });

  test('Default view has a clean URL', async ({ page }) => {
    await openOverview(page, 'sex=female');

    await removeFilter(page, 'Female').click();

    await expect(page).toHaveURL(/\/players$/);
  });

  test('Invalid URL values fall back to the defaults: an unknown sex', async ({
    page,
  }) => {
    await openOverview(page, 'sex=unknown');
    await expectFilterValue(page, 'Sex', 'All');

    expect(await playersAcrossPages(page, 'sex=unknown')).toHaveLength(100);
  });
});
