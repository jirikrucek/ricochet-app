import { expect, test } from '@playwright/test';

test('changes the app language from the selector', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: 'Ricochet App' }),
  ).toBeVisible();

  // The language selector is a Shadcn Select (combobox button + listbox popup)
  const trigger = page.getByRole('combobox', { name: 'Language' });
  await expect(trigger).toBeVisible();

  // Open the dropdown and choose German
  await trigger.click();
  await page.getByRole('option', { name: 'German' }).click();

  // UI should now render in German
  await expect(
    page.getByRole('heading', { name: 'Ricochet App' }),
  ).toBeVisible();
  await expect(page.getByText('Sprache')).toBeVisible();
  await expect(
    page.getByText('Die Initialisierung des Workspaces ist bereit.'),
  ).toBeVisible();
});
