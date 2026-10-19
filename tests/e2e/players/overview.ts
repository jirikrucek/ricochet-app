import { expect, type Page } from '@playwright/test';

export { DESKTOP, PHONE, expectNoHorizontalOverflow } from '../app-shell/shell';

export const SMALL_PHONE = { width: 320, height: 640 };

type Viewport = { width: number; height: number };

export async function openOverview(
  page: Page,
  search = '',
  viewport?: Viewport,
) {
  if (viewport) await page.setViewportSize(viewport);
  await page.goto(`/players${search ? `?${search}` : ''}`);
}

export function playersTable(page: Page) {
  return page.getByRole('table');
}

export function bodyRows(page: Page) {
  return playersTable(page).getByRole('rowgroup').nth(1).getByRole('row');
}

export async function expectPlayersListed(page: Page) {
  await expect(bodyRows(page).first()).toBeVisible();
}

// Full surnames as shown in the first column, in display order.
export async function shownSurnames(page: Page) {
  await expectPlayersListed(page);
  return bodyRows(page)
    .locator('td:nth-child(1)')
    .allInnerTexts()
    .then((texts) => texts.map((text) => text.trim()));
}

export function rowFor(page: Page, surname: string, firstName: string) {
  return bodyRows(page)
    .filter({ has: page.getByRole('cell', { name: surname, exact: true }) })
    .filter({ has: page.getByRole('cell', { name: firstName, exact: true }) });
}

// Connection to the local Supabase, set by playwright.config.ts from
// tests/support/localSupabaseEnv.ts (docs/standards/testing.md).
export function localSupabase() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error('playwright.config.ts did not set the local Supabase env');
  }
  return {
    playersUrl: `${url}/rest/v1/players`,
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  };
}
