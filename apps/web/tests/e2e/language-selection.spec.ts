import { expect, test } from '@playwright/test';

test('changes the app language from the selector', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: 'Ricochet App' }),
  ).toBeVisible();
  await expect(page.getByLabel('Language')).toBeVisible();

  await page.getByLabel('Language').selectOption('de');

  await expect(page.getByText('Ricochet App')).toBeVisible();
  await expect(page.getByText('Sprache')).toBeVisible();
  await expect(
    page.getByText('Die Initialisierung des Workspaces ist bereit.'),
  ).toBeVisible();
});
