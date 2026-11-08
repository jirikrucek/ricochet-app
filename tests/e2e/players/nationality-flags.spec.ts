import { expect, test } from '../fixtures';

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

  test('Tooltip shows the country name', async ({ page }) => {
    await useUiLanguage(page, 'en');
    await openOverview(page, 'nationality=HU');
    const flag = page
      .getByRole('img', { name: 'Hungary', exact: true })
      .first();
    const tooltip = page.getByRole('tooltip');

    await flag.hover();

    await expect(tooltip).toHaveText('Hungary');
    // The name stays on one line, not wrapped letter by letter.
    const box = await tooltip.boundingBox();
    expect(box?.width).toBeGreaterThan(40);
    expect(box?.height).toBeLessThan(60);

    await page.mouse.move(0, 0);
    await expect(tooltip).toBeHidden();
    await flag.focus();

    await expect(flag).toBeFocused();
    await expect(tooltip).toHaveText('Hungary');
  });
});
