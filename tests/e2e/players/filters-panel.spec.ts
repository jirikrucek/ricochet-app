import { expect, test } from '@playwright/test';

import { boxOf } from '../app/shell';
import {
  DESKTOP,
  applyButton,
  asNameSet,
  chooseFilters,
  filterSelect,
  filtersButton,
  filtersPanel,
  openFiltersPanel,
  openOverview,
  playersAcrossPages,
  playersTable,
  seededPlayers,
  shownNationalities,
  useUiLanguage,
} from './overview';

test.use({ viewport: DESKTOP });

test.beforeEach(async ({ page }) => {
  await useUiLanguage(page, 'en');
});

test.describe('Filters are chosen in a filters panel', () => {
  test('Filters stay out of the way until asked for', async ({ page }) => {
    await openOverview(page);

    await expect(filtersButton(page)).toBeVisible();
    await expect(filterSelect(page, 'Nationality')).toHaveCount(0);
    await expect(filterSelect(page, 'Sex')).toHaveCount(0);
  });
});

test.describe('Apply commits the filter draft', () => {
  test('Choosing options does not apply them', async ({ page }) => {
    await openOverview(page);
    await openFiltersPanel(page);

    await filterSelect(page, 'Nationality').click();
    await page.getByRole('option', { name: 'Poland', exact: true }).click();

    await expect(filterSelect(page, 'Nationality')).toContainText('Poland');
    await expect(page).not.toHaveURL(/nationality=/);
    await expect
      .poll(async () => new Set(await shownNationalities(page)).size)
      .toBeGreaterThan(1);
  });

  test('Apply applies the draft and collapses the panel', async ({
    page,
    request,
  }) => {
    await openOverview(page);

    await chooseFilters(page, { Nationality: 'Poland', Sex: 'Male' });

    await expect(page).toHaveURL(/nationality=PL/);
    await expect(page).toHaveURL(/sex=male/);
    await expect(filtersPanel(page)).toHaveCount(0);
    await expect(filtersButton(page)).toHaveAttribute('aria-expanded', 'false');
    const shown = await playersAcrossPages(page, 'nationality=PL&sex=male');
    expect(asNameSet(shown)).toEqual(
      asNameSet(
        await seededPlayers(request, { nationality: 'PL', sex: 'male' }),
      ),
    );
  });

  test('Closing without Apply discards the draft', async ({ page }) => {
    await openOverview(page, 'nationality=DE');
    await openFiltersPanel(page);
    await filterSelect(page, 'Nationality').click();
    await page.getByRole('option', { name: 'Poland', exact: true }).click();

    await page.keyboard.press('Escape');

    await expect(filtersPanel(page)).toHaveCount(0);
    await expect(page).toHaveURL(/nationality=DE/);
    await expect
      .poll(async () => new Set(await shownNationalities(page)))
      .toEqual(new Set(['DE']));
    await openFiltersPanel(page);
    await expect(filterSelect(page, 'Nationality')).toContainText('Germany');
  });
});

test.describe('Filters panel is a popover on wide screens', () => {
  test('Popover on a wide screen', async ({ page }) => {
    await openOverview(page);

    await openFiltersPanel(page);

    const button = await boxOf(filtersButton(page));
    const panel = await boxOf(filtersPanel(page));
    expect(panel.y).toBeGreaterThanOrEqual(button.y + button.height);
    expect(panel.x).toBeLessThanOrEqual(button.x + button.width);
    expect(panel.x + panel.width).toBeGreaterThanOrEqual(button.x);
    // The page behind stays usable: no overlay takes the click.
    await page
      .getByRole('link', { name: 'Tournaments' })
      .click({ trial: true });
  });

  test('Popover closes on an outside click', async ({ page }) => {
    await openOverview(page);
    await openFiltersPanel(page);
    await filterSelect(page, 'Nationality').click();
    await page.getByRole('option', { name: 'Poland', exact: true }).click();

    await page.getByRole('heading', { name: 'Players' }).click();

    await expect(filtersPanel(page)).toHaveCount(0);
    await expect(page).not.toHaveURL(/nationality=/);
    await expect
      .poll(async () => new Set(await shownNationalities(page)).size)
      .toBeGreaterThan(1);
  });
});

test.describe('Filters panel adapts when the viewport changes', () => {
  test('Opening the panel does not move the table', async ({ page }) => {
    await openOverview(page);
    const before = await boxOf(playersTable(page));

    await openFiltersPanel(page);

    await expect(applyButton(page)).toBeVisible();
    const after = await boxOf(playersTable(page));
    expect(after.y).toBe(before.y);
  });
});
