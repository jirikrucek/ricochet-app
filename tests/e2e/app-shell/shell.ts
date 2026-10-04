import { expect, type Locator, type Page } from '@playwright/test';

export const DESKTOP = { width: 1280, height: 800 };
export const PHONE = { width: 375, height: 812 };

type Viewport = { width: number; height: number };
type Box = { x: number; y: number; width: number; height: number };

export async function openAt(page: Page, viewport: Viewport, path = '/') {
  await page.setViewportSize(viewport);
  await page.goto(path);
}

export function banner(page: Page) {
  return page.getByRole('banner');
}

export function logoLink(page: Page) {
  return banner(page).getByRole('link', { name: 'Ricochet', exact: true });
}

export function logoImage(page: Page) {
  return logoLink(page).locator('img');
}

export function menuButton(page: Page, name = 'Open menu') {
  return banner(page).getByRole('button', { name });
}

export async function boxOf(locator: Locator): Promise<Box> {
  const box = await locator.boundingBox();
  expect(box, 'element should be rendered').not.toBeNull();
  return box as Box;
}

export function expectBoxInside(inner: Box, outer: Box) {
  expect(inner.x).toBeGreaterThanOrEqual(outer.x - 0.5);
  expect(inner.y).toBeGreaterThanOrEqual(outer.y - 0.5);
  expect(inner.x + inner.width).toBeLessThanOrEqual(
    outer.x + outer.width + 0.5,
  );
  expect(inner.y + inner.height).toBeLessThanOrEqual(
    outer.y + outer.height + 0.5,
  );
}

export function boxesIntersect(a: Box, b: Box) {
  return (
    a.x < b.x + b.width &&
    b.x < a.x + a.width &&
    a.y < b.y + b.height &&
    b.y < a.y + a.height
  );
}

export async function expectNoHorizontalOverflow(page: Page) {
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
}

export async function expectImageToHaveLoaded(image: Locator) {
  await expect(image).toBeVisible();
  const loaded = await image.evaluate(
    (el: HTMLImageElement) => el.complete && el.naturalWidth > 0,
  );
  expect(loaded).toBe(true);
}

export async function expectRenderedRatioToMatchViewBox(image: Locator) {
  const { rendered, viewBox } = await image.evaluate(
    async (el: HTMLImageElement) => {
      const markup = await (await fetch(el.src)).text();
      const svg = new DOMParser().parseFromString(markup, 'image/svg+xml');
      const [, , width, height] = (
        svg.documentElement.getAttribute('viewBox') ?? ''
      )
        .split(/[\s,]+/)
        .map(Number);
      const box = el.getBoundingClientRect();
      return { rendered: box.width / box.height, viewBox: width / height };
    },
  );
  expect(viewBox).toBeGreaterThan(0);
  expect(Math.abs(rendered - viewBox) / viewBox).toBeLessThanOrEqual(0.01);
}
