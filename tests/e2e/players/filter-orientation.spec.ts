import { expect, test, type Page } from '../fixtures';

import {
  DESKTOP,
  applyButton,
  chooseFilter,
  chooseFilters,
  filtersButton,
  filtersPanel,
  openFiltersPanel,
  openOverview,
  removeFilter,
  summary,
  useUiLanguage,
} from './overview';

test.use({ viewport: DESKTOP });

test.beforeEach(async ({ page }) => {
  await useUiLanguage(page, 'en');
});

// What a screen reader is told about the result of a filter change.
function announcement(page: Page) {
  return page.getByRole('status');
}

test.describe('Filter changes keep the visitor oriented', () => {
  test('Applying filters announces the result', async ({ page }) => {
    await openOverview(page);
    await expect(summary(page)).toHaveText('Showing 1–25 of 100');
    await chooseFilter(page, 'Sex', 'Female');

    await expect(filtersButton(page)).toBeFocused();
    await expect(announcement(page)).toHaveText('Showing 1–25 of 40');
  });

  test('Removing a chip announces the result', async ({ page }) => {
    await openOverview(page, 'sex=female');
    await expect(summary(page)).toHaveText('Showing 1–25 of 40');

    await removeFilter(page, 'Female').click();

    await expect(filtersButton(page)).toBeFocused();
    await expect(announcement(page)).toHaveText('Showing 1–25 of 100');
  });

  test('No match announced', async ({ page }) => {
    await openOverview(page);

    await chooseFilters(page, { Nationality: 'United Kingdom', Sex: 'Female' });

    await expect(filtersButton(page)).toBeFocused();
    await expect(announcement(page)).toHaveText(
      'No players match the selected filters',
    );
  });

  test('Applying without a change', async ({ page }) => {
    await openOverview(page, 'sex=female');
    await expect(summary(page)).toHaveText('Showing 1–25 of 40');
    await openFiltersPanel(page);

    await applyButton(page).click();

    await expect(filtersButton(page)).toBeFocused();
    await expect(announcement(page)).toHaveText('Showing 1–25 of 40');
  });
});

test.describe('Filters panel can be used with a keyboard', () => {
  test('Opening with the keyboard', async ({ page }) => {
    await openOverview(page);
    await filtersButton(page).focus();

    await page.keyboard.press('Enter');

    await expect(filtersPanel(page)).toBeVisible();
    await expect(filtersButton(page)).toHaveAttribute('aria-expanded', 'true');
  });

  test('Closing with Escape', async ({ page }) => {
    await openOverview(page);
    await filtersButton(page).focus();
    await page.keyboard.press('Enter');
    await expect(filtersPanel(page)).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(filtersPanel(page)).toHaveCount(0);
    await expect(filtersButton(page)).toBeFocused();
  });
});
