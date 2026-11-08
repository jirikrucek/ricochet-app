import { expect, test } from '../fixtures';

import {
  DESKTOP,
  PHONE,
  chooseFilter,
  expectNoHorizontalOverflow,
  filtersPanel,
  openOverview,
  pagination,
  paginationText,
  playersTable,
  removeFilter,
  summary,
  useUiLanguage,
} from './overview';

test.beforeEach(async ({ page }) => {
  await useUiLanguage(page, 'en');
});

test.describe('Pagination compacts below 744px', () => {
  test('Compact pagination on a phone', async ({ page }) => {
    await openOverview(page, 'page=2', PHONE);
    await expect(summary(page)).toHaveText('Showing 26–50 of 100');

    expect(await paginationText(page)).toBe('Previous · Page 2 of 4 · Next');
    await expect(
      pagination(page).getByRole('link', { name: /^\d+$/ }),
    ).toHaveCount(0);

    const summaryBox = (await summary(page).boundingBox())!;
    const navBox = (await pagination(page).boundingBox())!;
    expect(navBox.y).toBeGreaterThanOrEqual(summaryBox.y + summaryBox.height);
    await expectNoHorizontalOverflow(page);
  });
});

test.describe('Page changes keep the visitor oriented', () => {
  test.use({ viewport: DESKTOP });

  test('Moving to the next page', async ({ page }) => {
    await openOverview(page);
    await expect(summary(page)).toHaveText('Showing 1–25 of 100');
    const next = pagination(page).getByRole('link', { name: 'Next' });
    await next.scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);

    await next.click();

    await expect(summary(page)).toHaveText('Showing 26–50 of 100');
    await expect(playersTable(page).locator('caption')).toBeFocused();
    // The top of the table is in view, below the sticky top nav.
    const banner = (await page.getByRole('banner').boundingBox())!;
    await expect
      .poll(async () => (await playersTable(page).boundingBox())!.y)
      .toBeGreaterThanOrEqual(banner.y + banner.height - 1);
    const tableTop = (await playersTable(page).boundingBox())!.y;
    expect(tableTop).toBeLessThan(DESKTOP.height);
    await expect(page.locator('[aria-live="polite"]')).toHaveText(
      'Showing 26–50 of 100',
    );
  });

  test('a filter change does not announce a page change', async ({ page }) => {
    await openOverview(page, 'page=2');
    await expect(summary(page)).toHaveText('Showing 26–50 of 100');

    await chooseFilter(page, 'Sex', 'Female');

    await expect(summary(page)).toHaveText('Showing 1–25 of 40');
    await expect(page.locator('[aria-live="polite"]')).toHaveText('');
  });
});

test.describe('Filters work through the sheet on a phone', () => {
  test.use({ viewport: PHONE });

  test('Applying a filter in the sheet shows the first page of the result', async ({
    page,
  }) => {
    await openOverview(page, 'page=2');
    await expect(summary(page)).toHaveText('Showing 26–50 of 100');

    await chooseFilter(page, 'Sex', 'Female');

    await expect(filtersPanel(page)).toHaveCount(0);
    await expect(summary(page)).toHaveText('Showing 1–25 of 40');
    await expect(page).not.toHaveURL(/[?&]page=/);
    await expectNoHorizontalOverflow(page);
  });

  test('A chip removes the filter without opening the sheet', async ({
    page,
  }) => {
    await openOverview(page, 'sex=female');
    await expect(summary(page)).toHaveText('Showing 1–25 of 40');

    await removeFilter(page, 'Female').click();

    await expect(summary(page)).toHaveText('Showing 1–25 of 100');
    await expect(filtersPanel(page)).toHaveCount(0);
  });
});
