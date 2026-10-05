import { expect, test, type Locator } from '@playwright/test';
import {
  DESKTOP,
  PHONE,
  banner,
  boxOf,
  boxesIntersect,
  expectBoxInside,
  expectImageToHaveLoaded,
  expectNoHorizontalOverflow,
  expectRenderedRatioToMatchViewBox,
  logoImage,
  logoLink,
  menuButton,
  openAt,
} from './shell';

async function expectSvgSource(image: Locator) {
  const src = await image.getAttribute('src');
  expect(src).toMatch(/(\.svg(\?.*)?$)|(^data:image\/svg\+xml)/);
}

test('Logo shown on the home page', async ({ page }) => {
  await openAt(page, DESKTOP);

  const link = logoLink(page);
  await expect(link).toBeVisible();
  await expectImageToHaveLoaded(logoImage(page));

  await expect(banner(page).getByText('Ricochet', { exact: true })).toHaveCount(
    0,
  );
  await expect(link.locator('img')).toHaveCount(1);
  await expect(link.locator('svg')).toHaveCount(0);
});

test('Logo shown on a phone', async ({ page }) => {
  await openAt(page, PHONE);

  await expect(logoLink(page)).toBeVisible();
  await expectImageToHaveLoaded(logoImage(page));
});

test('Logo shown on every section of the app', async ({ page }) => {
  await openAt(page, DESKTOP, '/players');

  await expectImageToHaveLoaded(logoImage(page));
  const srcOnPlayers = await logoImage(page).getAttribute('src');

  await banner(page).getByRole('link', { name: 'Tournaments' }).click();
  await expect(page).toHaveURL(/\/tournaments$/);

  await expect(logoLink(page)).toBeVisible();
  await expectImageToHaveLoaded(logoImage(page));
  await expect(logoImage(page)).toHaveAttribute('src', srcOnPlayers ?? '');
});

test('Returning home from another section', async ({ page }) => {
  await openAt(page, DESKTOP, '/tournaments');

  await logoLink(page).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Ricochet App' }),
  ).toBeVisible();
});

test('Screen reader announces the brand name', async ({ page }) => {
  await openAt(page, DESKTOP);

  await expect(logoLink(page)).toHaveAccessibleName('Ricochet');
  await expect(logoImage(page)).toHaveAttribute('alt', '');
  await expect(logoImage(page)).toHaveAttribute('aria-hidden', 'true');
});

test('Brand name is not translated', async ({ page }) => {
  await openAt(page, DESKTOP);

  await page.locator('#language-trigger').click();
  await page.getByRole('option', { name: 'Čeština' }).click();
  await expect(page.getByRole('link', { name: 'Hráči' })).toBeVisible();

  await expect(logoLink(page)).toHaveAccessibleName('Ricochet');
});

test('Logo on a high-density display', async ({ browser }) => {
  const standard = await browser.newContext({ deviceScaleFactor: 1 });
  const dense = await browser.newContext({ deviceScaleFactor: 2 });
  try {
    const standardPage = await standard.newPage();
    const densePage = await dense.newPage();
    await openAt(standardPage, DESKTOP);
    await openAt(densePage, DESKTOP);

    expect(await densePage.evaluate(() => window.devicePixelRatio)).toBe(2);
    await expectImageToHaveLoaded(logoImage(densePage));
    await expectSvgSource(logoImage(densePage));

    const standardBox = await boxOf(logoImage(standardPage));
    const denseBox = await boxOf(logoImage(densePage));
    expect(denseBox.width).toBeCloseTo(standardBox.width, 1);
    expect(denseBox.height).toBeCloseTo(standardBox.height, 1);
    await expectRenderedRatioToMatchViewBox(logoImage(densePage));
  } finally {
    await standard.close();
    await dense.close();
  }
});

test('Logo when the page is zoomed in', async ({ page }) => {
  await openAt(page, DESKTOP);
  const image = logoImage(page);
  await expectImageToHaveLoaded(image);
  const normalBox = await boxOf(image);

  await page.evaluate(() => {
    document.documentElement.style.zoom = '2';
  });

  await expectSvgSource(image);
  const zoomedBox = await boxOf(image);
  expect(zoomedBox.width).toBeCloseTo(normalBox.width * 2, 0);
  expect(zoomedBox.height).toBeCloseTo(normalBox.height * 2, 0);
  await expectRenderedRatioToMatchViewBox(image);
});

test('Favicon shown in the browser tab', async ({ page, request }) => {
  await openAt(page, DESKTOP);

  const icon = page.locator('link[rel="icon"]');
  await expect(icon).toHaveAttribute('type', 'image/svg+xml');

  const href = await icon.getAttribute('href');
  expect(href).toBeTruthy();
  const response = await request.get(new URL(href ?? '', page.url()).href);
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('image/svg+xml');
});

test('Logo sits inside the nav bar at desktop width', async ({ page }) => {
  await openAt(page, DESKTOP);

  const bannerBox = await boxOf(banner(page));
  const logoBox = await boxOf(logoImage(page));
  expectBoxInside(logoBox, bannerBox);

  // The section links stay centred as a group in the bar.
  const players = await boxOf(
    banner(page).getByRole('link', { name: 'Players' }),
  );
  const tournaments = await boxOf(
    banner(page).getByRole('link', { name: 'Tournaments' }),
  );
  const linksCentre = (players.x + tournaments.x + tournaments.width) / 2;
  expect(
    Math.abs(linksCentre - (bannerBox.x + bannerBox.width / 2)),
  ).toBeLessThanOrEqual(2);

  // The language selector is right-aligned: its gutter mirrors the logo's.
  const language = await boxOf(
    banner(page).getByRole('combobox', { name: 'Language' }),
  );
  const leftGutter = logoBox.x - bannerBox.x;
  const rightGutter =
    bannerBox.x + bannerBox.width - (language.x + language.width);
  expect(Math.abs(rightGutter - leftGutter)).toBeLessThanOrEqual(1);
});

test('Logo fits beside the menu button on a phone', async ({ page }) => {
  await openAt(page, PHONE);

  const logoBox = await boxOf(logoImage(page));
  expectBoxInside(logoBox, await boxOf(banner(page)));
  expect(boxesIntersect(logoBox, await boxOf(menuButton(page)))).toBe(false);
  await expectNoHorizontalOverflow(page);
});

test('Logo fits on the narrowest supported phone', async ({ page }) => {
  await openAt(page, { width: 320, height: 640 });

  const image = logoImage(page);
  await expectImageToHaveLoaded(image);
  expectBoxInside(await boxOf(image), await boxOf(banner(page)));
  await expectRenderedRatioToMatchViewBox(image);
  await expectNoHorizontalOverflow(page);
});
