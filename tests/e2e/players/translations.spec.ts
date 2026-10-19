import { expect, test } from '@playwright/test';

import { DESKTOP, openOverview, playersTable, useUiLanguage } from './overview';

test.use({ viewport: DESKTOP });

const languages = [
  {
    language: 'English',
    code: 'en',
    heading: 'Players',
    columns: ['Surname', 'First name', 'Nationality'],
    filters: ['Nationality', 'Sex'],
    pagination: 'Pagination',
    previous: 'Previous',
    next: 'Next',
    pageSize: 'Players per page',
    summary: 'Showing 26–50 of 100',
  },
  {
    language: 'Czech',
    code: 'cs',
    heading: 'Hráči',
    columns: ['Příjmení', 'Jméno', 'Národnost'],
    filters: ['Národnost', 'Pohlaví'],
    pagination: 'Stránkování',
    previous: 'Předchozí',
    next: 'Další',
    pageSize: 'Hráčů na stránku',
    summary: 'Zobrazeno 26–50 z 100',
  },
  {
    language: 'German',
    code: 'de',
    heading: 'Spieler',
    columns: ['Nachname', 'Vorname', 'Nationalität'],
    filters: ['Nationalität', 'Geschlecht'],
    pagination: 'Seitennavigation',
    previous: 'Zurück',
    next: 'Weiter',
    pageSize: 'Spieler pro Seite',
    summary: '26–50 von 100',
  },
  {
    language: 'Polish',
    code: 'pl',
    heading: 'Gracze',
    columns: ['Nazwisko', 'Imię', 'Narodowość'],
    filters: ['Narodowość', 'Płeć'],
    pagination: 'Paginacja',
    previous: 'Poprzednia',
    next: 'Następna',
    pageSize: 'Graczy na stronę',
    summary: 'Wyświetlono 26–50 z 100',
  },
  {
    language: 'Dutch',
    code: 'nl',
    heading: 'Spelers',
    columns: ['Achternaam', 'Voornaam', 'Nationaliteit'],
    filters: ['Nationaliteit', 'Geslacht'],
    pagination: 'Paginering',
    previous: 'Vorige',
    next: 'Volgende',
    pageSize: 'Spelers per pagina',
    summary: '26–50 van 100',
  },
  {
    language: 'Hungarian',
    code: 'hu',
    heading: 'Játékosok',
    columns: ['Vezetéknév', 'Keresztnév', 'Nemzetiség'],
    filters: ['Nemzetiség', 'Nem'],
    pagination: 'Lapozás',
    previous: 'Előző',
    next: 'Következő',
    pageSize: 'Játékos oldalanként',
    summary: '26–50 / 100',
  },
];

test.describe('Player overview is translated into every supported UI language', () => {
  for (const expected of languages) {
    test(`Page text follows the UI language: ${expected.language}`, async ({
      page,
    }) => {
      await useUiLanguage(page, expected.code);

      // Page 2, so Previous and Next are both links.
      await openOverview(page, 'page=2');

      await expect(
        page.getByRole('heading', { level: 1, name: expected.heading }),
      ).toBeVisible();
      await expect(playersTable(page).getByRole('columnheader')).toHaveText(
        expected.columns,
      );
      for (const label of expected.filters) {
        await expect(
          page.getByRole('combobox', { name: label, exact: true }),
        ).toBeVisible();
      }
      await expect(
        page.getByRole('combobox', { name: expected.pageSize, exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole('paragraph').filter({ hasText: expected.summary }),
      ).toHaveText(expected.summary);
      const nav = page.getByRole('navigation', { name: expected.pagination });
      await expect(
        nav.getByRole('link', { name: expected.previous, exact: true }),
      ).toBeVisible();
      await expect(
        nav.getByRole('link', { name: expected.next, exact: true }),
      ).toBeVisible();
    });
  }
});
