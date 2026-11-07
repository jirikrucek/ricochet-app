import { expect, test } from '@playwright/test';

import { boxOf } from '../app/shell';
import {
  BELOW_TABLET,
  DESKTOP,
  PHONE,
  SMALL_PHONE,
  expectNoHorizontalOverflow,
  filterSelect,
  filtersPanel,
  openFiltersPanel,
  openOverview,
  useUiLanguage,
} from './overview';

test.beforeEach(async ({ page }) => {
  await useUiLanguage(page, 'en');
});

test.describe('Filters panel is a sheet on narrow screens', () => {
  test.use({ viewport: PHONE });

  test('Sheet on a phone', async ({ page }) => {
    await openOverview(page);

    await openFiltersPanel(page);

    // It slides up from the bottom edge, across the whole width, over a dimmed
    // page. Wait for the slide to finish before measuring where it ended.
    await expect
      .poll(async () => {
        const sheet = await boxOf(filtersPanel(page));
        return Math.round(sheet.y + sheet.height);
      })
      .toBe(PHONE.height);
    const sheet = await boxOf(filtersPanel(page));
    expect(sheet.x).toBe(0);
    expect(sheet.width).toBe(PHONE.width);
    await expect(page.locator('[data-slot="sheet-overlay"]')).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});

test.describe('Closing the sheet', () => {
  test.use({ viewport: PHONE });

  test('Close discards the draft', async ({ page }) => {
    await openOverview(page, 'nationality=DE');
    await openFiltersPanel(page);
    await filterSelect(page, 'Nationality').click();
    await page.getByRole('option', { name: 'Poland', exact: true }).click();

    await filtersPanel(page).getByRole('button', { name: 'Close' }).click();

    await expect(filtersPanel(page)).toHaveCount(0);
    await expect(page).toHaveURL(/nationality=DE/);
    await openFiltersPanel(page);
    await expect(filterSelect(page, 'Nationality')).toContainText('Germany');
  });

  test('Close is named in the UI language', async ({ page }) => {
    await useUiLanguage(page, 'de');
    await openOverview(page);

    await openFiltersPanel(page, /^Filter/);

    await expect(
      page.getByRole('dialog').getByRole('button', { name: 'Schließen' }),
    ).toBeVisible();
  });
});

test.describe('Filters panel adapts when the viewport changes', () => {
  test('Opening the panel does not move the table on a phone', async ({
    page,
  }) => {
    await page.setViewportSize(PHONE);
    await openOverview(page);
    // The modal sheet hides the page from the accessibility tree, so the table
    // is found by its element, not its role.
    const table = page.locator('table');
    const before = await boxOf(table);

    await openFiltersPanel(page);

    await expect(filtersPanel(page)).toBeVisible();
    const after = await boxOf(table);
    expect(after.y).toBe(before.y);
  });

  test('Crossing the breakpoint closes the panel', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await openOverview(page);
    await openFiltersPanel(page);
    await filterSelect(page, 'Nationality').click();
    await page.getByRole('option', { name: 'Poland', exact: true }).click();

    await page.setViewportSize(BELOW_TABLET);

    await expect(filtersPanel(page)).toHaveCount(0);
    await expect(page).not.toHaveURL(/nationality=/);
    await openFiltersPanel(page);
    await expect(filterSelect(page, 'Nationality')).toContainText('All');
  });

  for (const [name, viewport] of [
    ['a small phone', SMALL_PHONE],
    ['a phone', PHONE],
  ] as const) {
    test(`The page does not scroll horizontally on ${name}, with the panel closed or open`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await openOverview(page, 'nationality=CZ&sex=female');
      await expectNoHorizontalOverflow(page);

      await openFiltersPanel(page);

      await expect(filtersPanel(page)).toBeVisible();
      await expectNoHorizontalOverflow(page);
    });
  }
});

test.describe('Filters panel can be used with a keyboard', () => {
  test.use({ viewport: PHONE });

  test('Tab stays inside the sheet', async ({ page }) => {
    await openOverview(page);
    await openFiltersPanel(page);
    await expect(filtersPanel(page).locator(':focus')).toHaveCount(1);

    // More presses than the panel has controls, so focus has to wrap. Each
    // press waits for focus to move before the next: the dialog's focus guard
    // needs a moment to act, and back-to-back synthetic keypresses outrun it.
    const focused = () =>
      page.evaluate(() => document.activeElement?.outerHTML ?? '');
    for (let press = 0; press < 8; press++) {
      const before = await focused();
      await page.keyboard.press('Tab');
      await expect.poll(focused).not.toBe(before);
      await expect(filtersPanel(page).locator(':focus')).toHaveCount(1);
    }
  });
});
