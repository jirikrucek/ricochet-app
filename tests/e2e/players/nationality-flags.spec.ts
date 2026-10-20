import { expect, test } from '@playwright/test';

import { DESKTOP, openOverview, useUiLanguage } from './overview';

test.use({ viewport: DESKTOP });

test.describe('Nationality is shown as a flag with a localized country name', () => {
  test('Flag named in the current UI language', async ({ page }) => {
    await useUiLanguage(page, 'cs');
    await openOverview(page, 'nationality=DE');

    await expect(
      page.getByRole('img', { name: 'Německo', exact: true }).first(),
    ).toBeVisible();
  });

  test('Tooltip shows the country name on hover', async ({ page }) => {
    await useUiLanguage(page, 'en');
    await openOverview(page, 'nationality=HU');

    await page
      .getByRole('img', { name: 'Hungary', exact: true })
      .first()
      .hover();

    await expect(page.getByRole('tooltip')).toHaveText('Hungary');
  });

  test('Tooltip shows the country name on keyboard focus', async ({ page }) => {
    await useUiLanguage(page, 'en');
    await openOverview(page, 'nationality=HU');
    const flag = page
      .getByRole('img', { name: 'Hungary', exact: true })
      .first();
    await expect(flag).toBeVisible();

    await flag.focus();

    await expect(flag).toBeFocused();
    await expect(page.getByRole('tooltip')).toHaveText('Hungary');
  });
});
