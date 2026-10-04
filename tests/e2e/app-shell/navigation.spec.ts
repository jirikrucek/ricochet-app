import { expect, test, type Locator, type Page } from '@playwright/test';
import {
  DESKTOP,
  PHONE,
  banner,
  expectNoHorizontalOverflow,
  logoLink,
  menuButton,
  openAt,
} from './shell';

function bannerLink(page: Page, name: string) {
  return banner(page).getByRole('link', { name });
}

function bannerLanguage(page: Page) {
  return banner(page).getByRole('combobox', { name: 'Language' });
}

async function expectFullNav(page: Page) {
  await expect(logoLink(page)).toBeVisible();
  await expect(bannerLink(page, 'Players')).toBeVisible();
  await expect(bannerLink(page, 'Tournaments')).toBeVisible();
  await expect(bannerLanguage(page)).toBeVisible();
  await expect(menuButton(page)).toBeHidden();
}

async function expectCollapsedNav(page: Page) {
  await expect(logoLink(page)).toBeVisible();
  await expect(menuButton(page)).toBeVisible();
  await expect(bannerLink(page, 'Players')).toBeHidden();
  await expect(bannerLink(page, 'Tournaments')).toBeHidden();
  await expect(bannerLanguage(page)).toBeHidden();
}

test('Tablet width shows the full nav', async ({ page }) => {
  await openAt(page, { width: 744, height: 1024 });

  await expectFullNav(page);
});

test('Phone width shows the collapsed nav', async ({ page }) => {
  await openAt(page, PHONE);

  await expectCollapsedNav(page);
  await expectNoHorizontalOverflow(page);
});

test('Nav collapses just below the breakpoint', async ({ page }) => {
  await openAt(page, { width: 743, height: 1024 });

  await expect(logoLink(page)).toBeVisible();
  await expect(menuButton(page)).toBeVisible();
  await expect(bannerLink(page, 'Players')).toBeHidden();
  await expect(bannerLink(page, 'Tournaments')).toBeHidden();
});

test('Nav adapts when the viewport is resized', async ({ page }) => {
  await openAt(page, DESKTOP);
  await expectFullNav(page);

  await page.setViewportSize(PHONE);

  await expectCollapsedNav(page);
});

function menu(page: Page) {
  return page.getByRole('dialog');
}

async function openMenu(page: Page) {
  await menuButton(page).click();
  await expect(menu(page)).toBeVisible();
}

test('Opening the menu', async ({ page }) => {
  await openAt(page, PHONE);

  await menuButton(page).click();

  const dialog = menu(page);
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('link', { name: 'Players' })).toBeVisible();
  await expect(dialog.getByRole('link', { name: 'Tournaments' })).toBeVisible();
  await expect(
    dialog.getByRole('combobox', { name: 'Language' }),
  ).toBeVisible();
});

test('Active section is indicated in the menu', async ({ page }) => {
  await openAt(page, PHONE, '/players');

  await openMenu(page);

  const players = menu(page).getByRole('link', { name: 'Players' });
  const tournaments = menu(page).getByRole('link', { name: 'Tournaments' });
  await expect(players).toHaveAttribute('aria-current', 'page');
  await expect(tournaments).not.toHaveAttribute('aria-current', 'page');

  // Sighted users see it too: the active link is underlined and recoloured.
  const look = (link: Locator) =>
    link.evaluate((el) => {
      const style = getComputedStyle(el);
      return { color: style.color, underline: style.borderBottomColor };
    });
  const active = await look(players);
  const inactive = await look(tournaments);
  expect(active.underline).not.toBe('rgba(0, 0, 0, 0)');
  expect(inactive.underline).toBe('rgba(0, 0, 0, 0)');
  expect(active.color).not.toBe(inactive.color);
});

test('Going to Tournaments from the menu', async ({ page }) => {
  await openAt(page, PHONE);
  await openMenu(page);

  await menu(page).getByRole('link', { name: 'Tournaments' }).click();

  await expect(page).toHaveURL(/\/tournaments$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Tournaments' }),
  ).toBeVisible();
  await expect(menu(page)).toBeHidden();
});

test('Switching to German on a phone', async ({ page }) => {
  await openAt(page, PHONE);
  await openMenu(page);

  await menu(page).getByRole('combobox', { name: 'Language' }).click();
  await page.getByRole('option', { name: 'Deutsch' }).click();

  await expect(
    page.getByText('Die Initialisierung des Workspaces ist bereit.'),
  ).toBeVisible();
});

test('Closing the menu with Escape', async ({ page }) => {
  await openAt(page, PHONE, '/players');
  await openMenu(page);

  await page.keyboard.press('Escape');

  await expect(menu(page)).toBeHidden();
  await expect(page).toHaveURL(/\/players$/);
  await expect(menuButton(page)).toBeFocused();
});

test('Closing the menu by tapping outside it', async ({ page }) => {
  await openAt(page, PHONE);
  await openMenu(page);

  const dialogBox = await menu(page).boundingBox();
  expect(dialogBox?.x).toBeGreaterThan(20);
  await page.mouse.click(10, PHONE.height / 2);

  await expect(menu(page)).toBeHidden();
  await expect(menuButton(page)).toBeFocused();
});

test('Closing the menu with its close control', async ({ page }) => {
  await openAt(page, PHONE, '/players');
  await openMenu(page);

  await menu(page).getByRole('button', { name: 'Close menu' }).click();

  await expect(menu(page)).toBeHidden();
  await expect(page).toHaveURL(/\/players$/);
  await expect(menuButton(page)).toBeFocused();
});

test('Screen reader announces the menu button in English', async ({ page }) => {
  await openAt(page, PHONE);

  const button = menuButton(page);
  await expect(button).toHaveAccessibleName('Open menu');
  await expect(button).toHaveAttribute('aria-expanded', 'false');

  await button.click();
  await expect(menu(page)).toBeVisible();

  // The open modal hides the page behind it from the accessibility tree,
  // so read the trigger's state directly from the DOM.
  await expect(
    page.locator('header button[aria-label="Open menu"]'),
  ).toHaveAttribute('aria-expanded', 'true');
});

test('Menu button name follows the active language', async ({ page }) => {
  await openAt(page, PHONE);
  await openMenu(page);

  await menu(page).getByRole('combobox', { name: 'Language' }).click();
  await page.getByRole('option', { name: 'Čeština' }).click();
  await page.keyboard.press('Escape');
  await expect(menu(page)).toBeHidden();

  await expect(menuButton(page, 'Otevřít menu')).toBeVisible();
  await expect(menuButton(page, 'Otevřít menu')).toHaveAccessibleName(
    'Otevřít menu',
  );
});

test('Keyboard focus stays in the open menu', async ({ page }) => {
  await openAt(page, PHONE);

  await menuButton(page).focus();
  await page.keyboard.press('Enter');
  await expect(menu(page)).toBeVisible();

  const focusable = menu(page).locator(
    'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
  );
  const focusableCount = await focusable.count();
  expect(focusableCount).toBeGreaterThanOrEqual(4);
  await expect(focusable.first()).toBeFocused();

  const focusInMenu = () =>
    page.evaluate(
      () =>
        document
          .querySelector('[role="dialog"]')
          ?.contains(document.activeElement) ?? false,
    );

  for (let i = 1; i < focusableCount; i++) {
    await page.keyboard.press('Tab');
    await expect.poll(focusInMenu).toBe(true);
  }
  await expect(focusable.last()).toBeFocused();

  // One more Tab past the last item wraps to the first, not the page behind.
  await page.keyboard.press('Tab');
  await expect(focusable.first()).toBeFocused();
});

test('Menu closes when the viewport widens to tablet', async ({ page }) => {
  await openAt(page, PHONE);
  await openMenu(page);

  await page.setViewportSize(DESKTOP);

  await expect(menu(page)).toBeHidden();
  await expect(page.locator('[data-slot="sheet-overlay"]')).toHaveCount(0);
  await expect(
    banner(page).getByRole('link', { name: 'Players' }),
  ).toBeVisible();
  // The open menu locks scrolling with `overflow: hidden`; it must be released.
  await expect
    .poll(() =>
      page.evaluate(() =>
        [document.documentElement, document.body].map(
          (el) => getComputedStyle(el).overflow,
        ),
      ),
    )
    .toEqual(['visible', 'visible']);
});
