import { expect, test } from '../fixtures';

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
  removeFilter,
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

test.describe('Filters panel adapts when the viewport changes', () => {
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

  // One test per row of the scenario's Examples table. The two applied filters
  // put their chips beside the Filters button, the widest row of the page.
  for (const viewport of [SMALL_PHONE, PHONE]) {
    for (const panel of ['closed', 'open'] as const) {
      test(`Page does not scroll horizontally on a phone: ${viewport.width}px, panel ${panel}`, async ({
        page,
      }) => {
        await openOverview(page, 'nationality=CZ&sex=female', viewport);
        await expect(removeFilter(page, 'Female')).toBeVisible();

        if (panel === 'open') {
          await openFiltersPanel(page);
          await expect(filtersPanel(page)).toBeVisible();
        }

        await expectNoHorizontalOverflow(page);
      });
    }
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
