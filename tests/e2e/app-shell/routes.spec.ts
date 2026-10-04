import { expect, test } from '@playwright/test';
import { DESKTOP } from './shell';

test.use({ viewport: DESKTOP });

test('shows the Players page heading', async ({ page }) => {
  await page.goto('/players');

  await expect(
    page.getByRole('heading', { level: 1, name: 'Players' }),
  ).toBeVisible();
});

test('shows the Tournaments page heading', async ({ page }) => {
  await page.goto('/tournaments');

  await expect(
    page.getByRole('heading', { level: 1, name: 'Tournaments' }),
  ).toBeVisible();
});
