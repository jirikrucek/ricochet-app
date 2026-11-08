import { expect, test } from '../fixtures';

import {
  DESKTOP,
  PHONE,
  openFiltersPanel,
  openOverview,
  playersTable,
  useUiLanguage,
} from './overview';

test.use({ viewport: DESKTOP });

const languages = [
  {
    language: 'English',
    code: 'en',
    title: 'Filters',
    apply: 'Apply',
    heading: 'Players',
    columns: ['Surname', 'First name', 'Nationality'],
    filters: ['Nationality', 'Sex'],
    pagination: 'Pagination',
    previous: 'Previous',
    next: 'Next',
    summary: 'Showing 26–50 of 100',
    sexOptions: ['All', 'Male', 'Female'],
    description: 'Pick an option for each filter, then apply.',
    close: 'Close',
    applied: 'Applied filters',
    removeFemale: 'Remove filter: Female',
    clearAll: 'Clear all filters',
    noMatch: 'No players match the selected filters',
  },
  {
    language: 'Czech',
    code: 'cs',
    title: 'Filtry',
    apply: 'Použít',
    heading: 'Hráči',
    columns: ['Příjmení', 'Jméno', 'Národnost'],
    filters: ['Národnost', 'Pohlaví'],
    pagination: 'Stránkování',
    previous: 'Předchozí',
    next: 'Další',
    summary: 'Zobrazeno 26–50 z 100',
    sexOptions: ['Vše', 'Muž', 'Žena'],
    description: 'U každého filtru vyberte možnost a potom ji použijte.',
    close: 'Zavřít',
    applied: 'Použité filtry',
    removeFemale: 'Odebrat filtr: Žena',
    clearAll: 'Zrušit všechny filtry',
    noMatch: 'Vybraným filtrům neodpovídá žádný hráč',
  },
  {
    language: 'German',
    code: 'de',
    title: 'Filter',
    apply: 'Anwenden',
    heading: 'Spieler',
    columns: ['Nachname', 'Vorname', 'Nationalität'],
    filters: ['Nationalität', 'Geschlecht'],
    pagination: 'Seitennavigation',
    previous: 'Zurück',
    next: 'Weiter',
    summary: '26–50 von 100',
    sexOptions: ['Alle', 'Männlich', 'Weiblich'],
    description:
      'Wählen Sie bei jedem Filter eine Option und wenden Sie sie dann an.',
    close: 'Schließen',
    applied: 'Angewendete Filter',
    removeFemale: 'Filter entfernen: Weiblich',
    clearAll: 'Alle Filter zurücksetzen',
    noMatch: 'Keine Spieler entsprechen den gewählten Filtern',
  },
  {
    language: 'Polish',
    code: 'pl',
    title: 'Filtry',
    apply: 'Zastosuj',
    heading: 'Gracze',
    columns: ['Nazwisko', 'Imię', 'Narodowość'],
    filters: ['Narodowość', 'Płeć'],
    pagination: 'Paginacja',
    previous: 'Poprzednia',
    next: 'Następna',
    summary: 'Wyświetlono 26–50 z 100',
    sexOptions: ['Wszystkie', 'Mężczyzna', 'Kobieta'],
    description: 'Wybierz opcję w każdym filtrze, a następnie zastosuj.',
    close: 'Zamknij',
    applied: 'Zastosowane filtry',
    removeFemale: 'Usuń filtr: Kobieta',
    clearAll: 'Wyczyść wszystkie filtry',
    noMatch: 'Żaden gracz nie pasuje do wybranych filtrów',
  },
  {
    language: 'Dutch',
    code: 'nl',
    title: 'Filters',
    apply: 'Toepassen',
    heading: 'Spelers',
    columns: ['Achternaam', 'Voornaam', 'Nationaliteit'],
    filters: ['Nationaliteit', 'Geslacht'],
    pagination: 'Paginering',
    previous: 'Vorige',
    next: 'Volgende',
    summary: '26–50 van 100',
    sexOptions: ['Alle', 'Man', 'Vrouw'],
    description: 'Kies bij elk filter een optie en pas ze daarna toe.',
    close: 'Sluiten',
    applied: 'Toegepaste filters',
    removeFemale: 'Filter verwijderen: Vrouw',
    clearAll: 'Alle filters wissen',
    noMatch: 'Geen spelers voldoen aan de gekozen filters',
  },
  {
    language: 'Hungarian',
    code: 'hu',
    title: 'Szűrők',
    apply: 'Alkalmaz',
    heading: 'Játékosok',
    columns: ['Vezetéknév', 'Keresztnév', 'Nemzetiség'],
    filters: ['Nemzetiség', 'Nem'],
    pagination: 'Lapozás',
    previous: 'Előző',
    next: 'Következő',
    summary: '26–50 / 100',
    sexOptions: ['Összes', 'Férfi', 'Nő'],
    description: 'Válasszon egy lehetőséget minden szűrőnél, majd alkalmazza.',
    close: 'Bezárás',
    applied: 'Alkalmazott szűrők',
    removeFemale: 'Szűrő eltávolítása: Nő',
    clearAll: 'Összes szűrő törlése',
    noMatch: 'Egy játékos sem felel meg a kiválasztott szűrőknek',
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
      await expect(
        page.getByRole('button', { name: expected.title, exact: true }),
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

// The expected texts are written out here, not read from the locale files, so
// an edit to a translation has to change a test too.
test.describe('Player overview is translated into every supported UI language', () => {
  for (const expected of languages) {
    const [, sexLabel] = expected.filters;

    test(`Filters panel text follows the UI language: ${expected.language}, the panel`, async ({
      page,
    }) => {
      await useUiLanguage(page, expected.code);
      await openOverview(page);

      await openFiltersPanel(page, expected.title);

      const panel = page.getByRole('dialog', { name: expected.title });
      await expect(panel).toBeVisible();
      for (const label of expected.filters) {
        await expect(
          panel.getByRole('combobox', { name: label, exact: true }),
        ).toBeVisible();
      }
      await panel
        .getByRole('combobox', { name: sexLabel, exact: true })
        .click();
      await expect(page.getByRole('option')).toHaveText(expected.sexOptions);
      // Closes the open list of options, not the panel.
      await page.keyboard.press('Escape');
      await expect(
        panel.getByRole('button', { name: expected.apply, exact: true }),
      ).toBeVisible();
    });

    test(`Filters panel text follows the UI language: ${expected.language}, the applied filters`, async ({
      page,
    }) => {
      await useUiLanguage(page, expected.code);

      await openOverview(page, 'nationality=GB&sex=female');

      await expect(
        page.getByRole('list', { name: expected.applied }),
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: expected.removeFemale, exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: expected.clearAll, exact: true }),
      ).toBeVisible();
      await expect(page.getByText(expected.noMatch)).toBeVisible();
    });

    test(`Filters panel text follows the UI language: ${expected.language}, the sheet`, async ({
      page,
    }) => {
      await useUiLanguage(page, expected.code);
      await openOverview(page, '', PHONE);

      await openFiltersPanel(page, expected.title);

      const sheet = page.getByRole('dialog', { name: expected.title });
      await expect(sheet.getByText(expected.description)).toBeVisible();
      await expect(
        sheet.getByRole('button', { name: expected.close, exact: true }),
      ).toBeVisible();
      await expect(
        sheet.getByRole('button', { name: expected.apply, exact: true }),
      ).toBeVisible();
    });
  }
});
