import { expect, test } from '@playwright/test';

import {
  DESKTOP,
  bodyRows,
  expectPlayersListed,
  indexOfPlayer,
  openOverview,
  playersAcrossPages,
  surnameHeader,
  surnameSortButton,
  useUiLanguage,
} from './overview';

test.use({ viewport: DESKTOP });

function expectInOrder(indexes: number[]) {
  expect(indexes).toEqual([...indexes].sort((a, b) => a - b));
}

async function firstSurname(page: import('@playwright/test').Page) {
  await expectPlayersListed(page);
  return (
    await bodyRows(page).first().getByRole('cell').first().innerText()
  ).trim();
}

test.describe('Players are sorted by surname', () => {
  test.beforeEach(async ({ page }) => {
    await useUiLanguage(page, 'en');
  });

  test('Default order is ascending by surname', async ({ page }) => {
    const players = await playersAcrossPages(page);

    expectInOrder([
      indexOfPlayer(players, 'Bakker'),
      indexOfPlayer(players, 'Nagy'),
      indexOfPlayer(players, 'Wagner'),
    ]);
  });

  test('Surname prefix is ignored when sorting', async ({ page }) => {
    const players = await playersAcrossPages(page);

    expectInOrder([
      indexOfPlayer(players, 'Bakker', 'Anna'),
      indexOfPlayer(players, 'Novák', 'Jan'),
      indexOfPlayer(players, 'de Vries', 'Pieter'),
    ]);
  });

  test('Sorting ignores letter case', async ({ page }) => {
    const players = await playersAcrossPages(page);

    expectInOrder([
      indexOfPlayer(players, 'Macbeth'),
      indexOfPlayer(players, 'MacDonald'),
    ]);
  });

  test('Sorting follows the current UI language', async ({ page, context }) => {
    await useUiLanguage(page, 'cs');
    const czech = await playersAcrossPages(page);
    expectInOrder([
      indexOfPlayer(czech, 'Horák'),
      indexOfPlayer(czech, 'Chládek'),
    ]);

    const englishPage = await context.newPage();
    await useUiLanguage(englishPage, 'en');
    const english = await playersAcrossPages(englishPage);
    expectInOrder([
      indexOfPlayer(english, 'Chládek'),
      indexOfPlayer(english, 'Horák'),
    ]);
  });

  test('Shared surname is ordered by first name', async ({ page }) => {
    const players = await playersAcrossPages(page);

    expectInOrder([
      indexOfPlayer(players, 'Szabó', 'Anna'),
      indexOfPlayer(players, 'Szabó', 'Petra'),
    ]);
  });

  test('Same name is ordered by surname suffix', async ({ page }) => {
    const players = await playersAcrossPages(page);

    expectInOrder([
      indexOfPlayer(players, 'Kovář', 'Tomáš'),
      indexOfPlayer(players, 'Kovář jr.', 'Tomáš'),
      indexOfPlayer(players, 'Kovář sr.', 'Tomáš'),
    ]);
  });

  test('Descending order reverses every key', async ({ page }) => {
    await openOverview(page);
    await surnameSortButton(page).click();
    await expect(page).toHaveURL(/[?&]sort=desc/);

    const players = await playersAcrossPages(page, 'sort=desc');

    expectInOrder([
      indexOfPlayer(players, 'de Vries', 'Pieter'),
      indexOfPlayer(players, 'Kovář jr.', 'Tomáš'),
      indexOfPlayer(players, 'Kovář', 'Tomáš'),
      indexOfPlayer(players, 'Bakker', 'Anna'),
    ]);
  });
});

test.describe('Surname column header toggles and announces the sort direction', () => {
  test('Switching to descending', async ({ page }) => {
    await openOverview(page);
    await expect(surnameHeader(page)).toHaveAttribute('aria-sort', 'ascending');

    await surnameSortButton(page).click();

    await expect(surnameHeader(page)).toHaveAttribute(
      'aria-sort',
      'descending',
    );
    await expect(
      surnameSortButton(page).locator('[data-sort-indicator="descending"]'),
    ).toBeVisible();
    expect(await firstSurname(page)).toBe('Zimmermann');
  });

  test('Switching back to ascending', async ({ page }) => {
    await openOverview(page, 'sort=desc');
    await expect(surnameHeader(page)).toHaveAttribute(
      'aria-sort',
      'descending',
    );

    await surnameSortButton(page).click();

    await expect(surnameHeader(page)).toHaveAttribute('aria-sort', 'ascending');
    await expect(
      surnameSortButton(page).locator('[data-sort-indicator="ascending"]'),
    ).toBeVisible();
    expect(await firstSurname(page)).toBe('Bakker');
  });
});

test.describe('Invalid URL values fall back to the defaults', () => {
  test('an unknown sort direction sorts ascending', async ({ page }) => {
    await openOverview(page, 'sort=sideways');

    await expect(surnameHeader(page)).toHaveAttribute('aria-sort', 'ascending');
    expect(await firstSurname(page)).toBe('Bakker');
  });
});
