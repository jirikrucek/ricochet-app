import { expect, test } from '@playwright/test';

import {
  DESKTOP,
  PHONE,
  asNameSet,
  chooseFilter,
  expectNoHorizontalOverflow,
  expectPlayersListed,
  filterSelect,
  openOverview,
  playersAcrossPages,
  playersTable,
  seededPlayers,
  useUiLanguage,
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

    await filterSelect(page, 'Geschlecht').click();

    await expect(page.getByRole('option')).toHaveText([
      'Alle',
      'Männlich',
      'Weiblich',
    ]);
  });
});

test.describe('Filters combine and adapt to narrow screens', () => {
  test('Both filters applied together', async ({ page, request }) => {
    await openOverview(page);

    await chooseFilter(page, 'Nationality', 'Poland');
    await chooseFilter(page, 'Sex', 'Male');

    await expect(page).toHaveURL(/nationality=PL/);
    await expect(page).toHaveURL(/sex=male/);
    const shown = await playersAcrossPages(page, 'nationality=PL&sex=male');
    expect(asNameSet(shown)).toEqual(
      asNameSet(
        await seededPlayers(request, { nationality: 'PL', sex: 'male' }),
      ),
    );
  });

  test('Filters stack on a phone', async ({ page }) => {
    await openOverview(page, '', PHONE);
    await expectPlayersListed(page);

    const nationality = await filterSelect(page, 'Nationality').boundingBox();
    const sex = await filterSelect(page, 'Sex').boundingBox();

    expect(nationality).not.toBeNull();
    expect(sex).not.toBeNull();
    expect(sex!.y).toBeGreaterThanOrEqual(nationality!.y + nationality!.height);
    expect(Math.abs(sex!.x - nationality!.x)).toBeLessThanOrEqual(1);
    await expectNoHorizontalOverflow(page);
  });
});

test.describe('No players match the filters', () => {
  test('No players match the filters', async ({ page }) => {
    await openOverview(page);

    await chooseFilter(page, 'Nationality', 'United Kingdom');
    await chooseFilter(page, 'Sex', 'Female');

    await expect(
      page.getByText('No players match the selected filters'),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Clear filters' }),
    ).toBeVisible();
    await expect(playersTable(page)).toHaveCount(0);
  });

  test('Clearing filters from the no-match state', async ({ page }) => {
    await openOverview(page, 'nationality=GB&sex=female');

    await page.getByRole('button', { name: 'Clear filters' }).click();

    await expect(filterSelect(page, 'Nationality')).toContainText('All');
    await expect(filterSelect(page, 'Sex')).toContainText('All');
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

    await expect(filterSelect(page, 'Sex')).toContainText('Male');
    await expect(page).toHaveURL(/[?&]sex=male/);
  });

  test('Default view has a clean URL', async ({ page }) => {
    await openOverview(page, 'sex=female');

    await chooseFilter(page, 'Sex', 'All');

    await expect(page).toHaveURL(/\/players$/);
  });

  test('an unknown sex lists players of both sexes', async ({ page }) => {
    await openOverview(page, 'sex=unknown');
    await expect(filterSelect(page, 'Sex')).toContainText('All');

    expect(await playersAcrossPages(page, 'sex=unknown')).toHaveLength(100);
  });
});
