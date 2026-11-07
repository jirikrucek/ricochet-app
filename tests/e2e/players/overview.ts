import {
  expect,
  type APIRequestContext,
  type Page,
  type Route,
} from '@playwright/test';

import { waitForFonts } from '../app/shell';

export { DESKTOP, PHONE, expectNoHorizontalOverflow } from '../app/shell';

export const SMALL_PHONE = { width: 320, height: 640 };
// A viewport below the 744px tablet breakpoint that is not a phone.
export const BELOW_TABLET = { width: 600, height: 800 };

type Viewport = { width: number; height: number };

export async function openOverview(
  page: Page,
  search = '',
  viewport?: Viewport,
) {
  if (viewport) await page.setViewportSize(viewport);
  await page.goto(`/players${search ? `?${search}` : ''}`);
  await waitForFonts(page);
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
// tests/support/localSupabaseEnv.ts (docs/standards/testing-standard.md).
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

// Every player of a view in display order, read page by page until the
// summary's last row is the total.
export async function playersAcrossPages(page: Page, search = '') {
  const all: ShownPlayer[] = [];
  for (let pageNumber = 1; pageNumber <= 10; pageNumber++) {
    const params = new URLSearchParams(search);
    if (pageNumber > 1) params.set('page', String(pageNumber));
    await openOverview(page, params.toString());
    all.push(...(await shownPlayers(page)));
    // Any UI language: the summary is the one text with "from–to … total".
    const text = await page
      .getByRole('paragraph')
      .filter({ hasText: /^\D*\d+–\d+\D+\d+\D*$/ })
      .innerText();
    const [, , to, total] = /(\d+)–(\d+)\D+(\d+)/.exec(text)!.map(Number);
    if (to >= total) break;
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

// The one button that opens the filters panel. Its name starts with "Filters"
// and ends with the count of applied filters when there are any.
export function filtersButton(page: Page) {
  return page.getByRole('button', { name: /^Filters/ });
}

export function applyButton(page: Page) {
  return page.getByRole('button', { name: 'Apply', exact: true });
}

// `name` is the button's exact name in another language, or a pattern.
export async function openFiltersPanel(page: Page, name?: string | RegExp) {
  const button = name
    ? page.getByRole('button', { name, exact: typeof name === 'string' })
    : filtersButton(page);
  if ((await button.getAttribute('aria-expanded')) !== 'true') {
    await button.click();
  }
}

// The chips of the applied filters, beside the Filters button.
export function appliedFilters(page: Page) {
  return page.getByRole('list', { name: 'Applied filters' });
}

export function removeFilter(page: Page, name: string) {
  return page.getByRole('link', {
    name: `Remove filter: ${name}`,
    exact: true,
  });
}

export function clearAllFilters(page: Page) {
  return page.getByRole('link', { name: 'Clear all filters', exact: true });
}

// The panel the Filters button opens: a popover or a sheet, both a dialog.
export function filtersPanel(page: Page) {
  return page.getByRole('dialog', { name: 'Filters' });
}

// A select inside the open filters panel.
export function filterSelect(page: Page, label: string) {
  return page.getByRole('combobox', { name: label, exact: true });
}

// Chooses one option in the filters panel and applies it, so a test that
// filters twice applies twice, as it did when each select applied on change.
export async function chooseFilter(page: Page, label: string, option: string) {
  await openFiltersPanel(page);
  await filterSelect(page, label).click();
  await page.getByRole('option', { name: option, exact: true }).click();
  await applyButton(page).click();
}

// Chooses an option in several filters and applies them all with one Apply.
export async function chooseFilters(
  page: Page,
  choices: Record<string, string>,
) {
  await openFiltersPanel(page);
  for (const [label, option] of Object.entries(choices)) {
    await filterSelect(page, label).click();
    await page.getByRole('option', { name: option, exact: true }).click();
  }
  await applyButton(page).click();
}

// Reads what the panel shows for one filter, then puts the panel away again.
export async function expectFilterValue(
  page: Page,
  label: string,
  value: string,
) {
  await openFiltersPanel(page);
  await expect(filterSelect(page, label)).toContainText(value);
  await page.keyboard.press('Escape');
  await expect(filtersPanel(page)).toHaveCount(0);
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

// The players a PostgREST filter returns from the local seed, as the overview
// shows them, for comparing a filtered view with the data behind it.
export async function seededPlayers(
  request: APIRequestContext,
  filter: Record<string, string> = {},
): Promise<ShownPlayer[]> {
  const { playersUrl, headers } = localSupabase();
  const params = new URLSearchParams({
    select: 'first_name,surname_prefix,surname,surname_suffix',
  });
  for (const [column, value] of Object.entries(filter)) {
    params.set(column, `eq.${value}`);
  }
  const response = await request.get(`${playersUrl}?${params}`, { headers });
  expect(response.ok()).toBe(true);
  const rows = (await response.json()) as {
    first_name: string;
    surname_prefix: string | null;
    surname: string;
    surname_suffix: string | null;
  }[];
  return rows.map((row) => ({
    surname: [row.surname_prefix, row.surname, row.surname_suffix]
      .filter(Boolean)
      .join(' '),
    firstName: row.first_name,
  }));
}

export function asNameSet(players: ShownPlayer[]) {
  return new Set(players.map((p) => `${p.firstName} ${p.surname}`));
}

// The visible pagination: the numbered variant from 744px, the compact one
// below. The hidden variant is display:none, so it isn't in the a11y tree.
export function pagination(page: Page) {
  return page.getByRole('navigation', { name: 'Pagination' });
}

// The pagination as it reads, e.g. "Previous 1 2 … 10 Next".
export async function paginationText(page: Page) {
  const items = await pagination(page)
    .locator('li')
    .evaluateAll((lis) =>
      lis.map((li) =>
        li.querySelector('[data-slot="pagination-ellipsis"]')
          ? '…'
          : (li.textContent ?? '').trim(),
      ),
    );
  return items.join(' ');
}

// The visible summary paragraph (the live region repeats it after a page
// change).
export function summary(page: Page) {
  return page
    .getByRole('paragraph')
    .filter({ hasText: /^Showing \d+–\d+ of \d+$/ });
}

// The two backend calls behind the overview, for the states the seed can't
// produce (docs/standards/testing-standard.md).
export const PLAYERS_API = '**/rest/v1/rpc/players_sorted*';
export const NATIONALITIES_API = '**/rest/v1/player_nationalities*';

export type PlayerRowInApi = {
  id: number;
  first_name: string;
  surname_prefix: string | null;
  surname: string;
  surname_suffix: string | null;
  nationality: string;
  sex: 'male' | 'female';
};

// Answers a players request the way PostgREST does: the rows, and the total in
// Content-Range, which supabase-js reads across origins.
export function fulfillPlayers(
  route: Route,
  rows: PlayerRowInApi[],
  total = rows.length,
) {
  const offset = Number(
    new URL(route.request().url()).searchParams.get('offset') ?? 0,
  );
  return route.fulfill({
    status: 200,
    contentType: 'application/json',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Expose-Headers': 'Content-Range',
      'Content-Range':
        rows.length === 0
          ? `*/${total}`
          : `${offset}-${offset + rows.length - 1}/${total}`,
    },
    body: JSON.stringify(rows),
  });
}

// Pretends the backend holds `total` players, more than the seed has, answering
// each page request with the rows of that page.
export function pretendPlayerCount(page: Page, total: number) {
  return page.route(PLAYERS_API, (route) => {
    const params = new URL(route.request().url()).searchParams;
    const offset = Number(params.get('offset') ?? 0);
    const limit = Number(params.get('limit'));
    const count = Math.max(0, Math.min(limit, total - offset));
    const rows = Array.from({ length: count }, (_, index) => ({
      id: offset + index + 1,
      first_name: 'Alex',
      surname_prefix: null,
      surname: `Example${offset + index + 1}`,
      surname_suffix: null,
      nationality: 'CZ',
      sex: 'male' as const,
    }));
    return fulfillPlayers(route, rows, total);
  });
}
