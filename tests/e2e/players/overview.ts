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

// Sets the UI language the way the language selector persists it, before the
// app boots.
export async function useUiLanguage(page: Page, language: string) {
  await page.addInitScript((lng) => {
    localStorage.setItem('i18nextLng', lng);
  }, language);
}

export type ShownPlayer = { surname: string; firstName: string };

async function shownPlayers(page: Page): Promise<ShownPlayer[]> {
  await expectPlayersListed(page);
  // One round trip for all rows; per-row role queries are slow at 50 rows.
  return bodyRows(page).evaluateAll((rows) =>
    rows.map((row) => {
      const [surname, firstName] = Array.from(
        row.querySelectorAll('td'),
        (cell) => (cell.textContent ?? '').trim(),
      );
      return { surname, firstName };
    }),
  );
}

// Every player of a view in display order, read at 50 per page. Stops when a
// page repeats the previous one (a page beyond the last falls back to page 1).
export async function playersAcrossPages(page: Page, search = '') {
  const all: ShownPlayer[] = [];
  let previous = '';
  for (let pageNumber = 1; pageNumber <= 10; pageNumber++) {
    const params = new URLSearchParams(search);
    params.set('pageSize', '50');
    if (pageNumber > 1) params.set('page', String(pageNumber));
    await openOverview(page, params.toString());
    const players = await shownPlayers(page);
    const key = JSON.stringify(players);
    if (key === previous) break;
    previous = key;
    all.push(...players);
  }
  return all;
}

export function indexOfPlayer(
  players: ShownPlayer[],
  surname: string,
  firstName?: string,
) {
  const index = players.findIndex(
    (p) =>
      p.surname === surname &&
      (firstName === undefined || p.firstName === firstName),
  );
  expect(
    index,
    `${firstName ?? ''} ${surname} should be listed`,
  ).toBeGreaterThanOrEqual(0);
  return index;
}

export function surnameHeader(page: Page) {
  return playersTable(page).getByRole('columnheader', { name: 'Surname' });
}

export function surnameSortButton(page: Page) {
  return surnameHeader(page).getByRole('button', { name: 'Surname' });
}

export function filterSelect(page: Page, label: string) {
  return page.getByRole('combobox', { name: label, exact: true });
}

export async function chooseFilter(page: Page, label: string, option: string) {
  await filterSelect(page, label).click();
  await page.getByRole('option', { name: option, exact: true }).click();
}

// Nationality codes of the listed rows, read from the flags.
export async function shownNationalities(page: Page) {
  await expectPlayersListed(page);
  return bodyRows(page)
    .locator('img[data-country]')
    .evaluateAll((flags) =>
      flags.map((flag) => flag.getAttribute('data-country')),
    );
}
