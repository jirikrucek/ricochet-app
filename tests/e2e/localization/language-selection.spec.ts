import { expect, test, type Locator } from '@playwright/test';

async function expectImageToHaveLoaded(image: Locator) {
  await expect(image).toBeVisible();
  const loaded = await image.evaluate(
    (el: HTMLImageElement) => el.complete && el.naturalWidth > 0,
  );
  expect(loaded).toBe(true);
}

test('changes the app language from the selector', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: 'Ricochet App' }),
  ).toBeVisible();

  // The language selector is a Shadcn Select (combobox button + listbox popup)
  const trigger = page.getByRole('combobox', { name: 'Language' });
  await expect(trigger).toBeVisible();

  // Open the dropdown and choose German (shown by its native name)
  await trigger.click();
  await page.getByRole('option', { name: 'Deutsch' }).click();

  // UI should now render in German
  await expect(
    page.getByRole('heading', { name: 'Ricochet App' }),
  ).toBeVisible();
  await expect(page.getByText('Sprache')).toBeVisible();
  await expect(
    page.getByText('Die Initialisierung des Workspaces ist bereit.'),
  ).toBeVisible();
});

test('shows native names regardless of active locale', async ({ page }) => {
  await page.goto('/');

  const trigger = page.locator('#language-trigger');
  await trigger.click();
  await page.getByRole('option', { name: 'Čeština' }).click();

  await trigger.click();
  await expect(page.getByRole('option', { name: 'English' })).toBeVisible();
  await expect(page.getByRole('option', { name: 'Deutsch' })).toBeVisible();
});

test('shows the selected language native name when collapsed', async ({
  page,
}) => {
  await page.goto('/');

  const trigger = page.locator('#language-trigger');
  await trigger.click();
  await page.getByRole('option', { name: 'Polski' }).click();

  await expect(trigger).toContainText('Polski');
});

test('shows a flag icon for each language option', async ({ page }) => {
  await page.goto('/');

  const trigger = page.locator('#language-trigger');
  await trigger.click();

  const options = page.getByRole('option');
  await expect(options).toHaveCount(6);
  for (const option of await options.all()) {
    await expectImageToHaveLoaded(option.locator('img'));
  }
});

test('shows a flag icon when collapsed', async ({ page }) => {
  await page.goto('/');

  const trigger = page.locator('#language-trigger');
  await trigger.click();
  await page.getByRole('option', { name: 'Polski' }).click();

  await expectImageToHaveLoaded(trigger.locator('img'));
});

test('announces only the native language name to screen readers', async ({
  page,
}) => {
  await page.goto('/');

  const trigger = page.locator('#language-trigger');
  await trigger.click();

  const option = page.getByRole('option', { name: 'Deutsch' });
  await expect(option).toBeVisible();
  await expect(option.locator('img')).toHaveAttribute('aria-hidden', 'true');

  await option.click();
  await expect(trigger).toContainText('Deutsch');
  await expect(trigger.locator('img')).toHaveAttribute('aria-hidden', 'true');
});
