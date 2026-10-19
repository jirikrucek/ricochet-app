import { expect, test } from '@playwright/test';

import {
  DESKTOP,
  bodyRows,
  chooseFilter,
  filterSelect,
  openOverview,
  pageSizeSelect,
  pagination,
  paginationText,
  playersTable,
  shownNationalities,
  summary,
  surnameHeader,
  surnameSortButton,
  useUiLanguage,
} from './overview';

test.use({ viewport: DESKTOP });

test.beforeEach(async ({ page }) => {
  await useUiLanguage(page, 'en');
});

test.describe('Player overview is paginated with a visitor-chosen page size', () => {
  test('First page at the default page size', async ({ page }) => {
    await openOverview(page);

    await expect(bodyRows(page)).toHaveCount(25);
    await expect(summary(page)).toHaveText('Showing 1–25 of 100');
    await expect(pageSizeSelect(page)).toContainText('25');
  });

  test('Last page shows the remaining players', async ({ page }) => {
    await openOverview(page, 'sex=female');
    await expect(summary(page)).toHaveText('Showing 1–25 of 40');

    await pagination(page).getByRole('link', { name: 'Next' }).click();

    await expect(bodyRows(page)).toHaveCount(15);
    await expect(summary(page)).toHaveText('Showing 26–40 of 40');
  });

  test('Changing the page size', async ({ page }) => {
    await openOverview(page);

    await chooseFilter(page, 'Players per page', '10');

    await expect(bodyRows(page)).toHaveCount(10);
    await expect(summary(page)).toHaveText('Showing 1–10 of 100');
    await expect(
      pagination(page).getByRole('link', { name: '10', exact: true }),
    ).toBeVisible();
    expect(await paginationText(page)).toMatch(/ 10 Next$/);
  });

  test('Summary counts only filtered players', async ({ page }) => {
    await openOverview(page);

    await chooseFilter(page, 'Sex', 'Female');

    await expect(summary(page)).toHaveText('Showing 1–25 of 40');
  });
});

test.describe('Page links show a compact page range on wide screens', () => {
  test('First page of several', async ({ page }) => {
    await openOverview(page, 'pageSize=10');
    await expect(summary(page)).toHaveText('Showing 1–10 of 100');

    expect(await paginationText(page)).toBe('Previous 1 2 … 10 Next');
    await expect(
      pagination(page).getByRole('link', { name: '1', exact: true }),
    ).toHaveAttribute('aria-current', 'page');
    await expect(
      pagination(page).getByText('Previous', { exact: true }),
    ).toHaveAttribute('aria-disabled', 'true');
    await expect(
      pagination(page).getByRole('link', { name: 'Previous' }),
    ).toHaveCount(0);
  });

  test('Last page disables Next', async ({ page }) => {
    await openOverview(page, 'pageSize=10&page=10');
    await expect(summary(page)).toHaveText('Showing 91–100 of 100');

    expect(await paginationText(page)).toBe('Previous 1 … 9 10 Next');
    await expect(
      pagination(page).getByRole('link', { name: '10', exact: true }),
    ).toHaveAttribute('aria-current', 'page');
    await expect(
      pagination(page).getByText('Next', { exact: true }),
    ).toHaveAttribute('aria-disabled', 'true');
    await expect(
      pagination(page).getByRole('link', { name: 'Next' }),
    ).toHaveCount(0);
  });

  test('Gaps collapse into ellipses', async ({ page }) => {
    await openOverview(page, 'pageSize=10&page=5');
    await expect(summary(page)).toHaveText('Showing 41–50 of 100');

    expect(await paginationText(page)).toBe('Previous 1 … 4 5 6 … 10 Next');
  });

  test('One-page gap shows the page number', async ({ page }) => {
    await openOverview(page);
    await expect(summary(page)).toHaveText('Showing 1–25 of 100');

    expect(await paginationText(page)).toBe('Previous 1 2 3 4 Next');
  });

  test('Going to a numbered page', async ({ page }) => {
    await openOverview(page, 'pageSize=10');

    await pagination(page)
      .getByRole('link', { name: '10', exact: true })
      .click();

    await expect(summary(page)).toHaveText('Showing 91–100 of 100');
  });
});

test.describe('Pagination hides what does not apply', () => {
  test('One page of results', async ({ page }) => {
    await openOverview(page);

    await chooseFilter(page, 'Nationality', 'Hungary');

    await expect(summary(page)).toHaveText('Showing 1–4 of 4');
    await expect(pageSizeSelect(page)).toBeVisible();
    await expect(pagination(page)).toHaveCount(0);
  });

  test('No results', async ({ page }) => {
    await openOverview(page);

    await chooseFilter(page, 'Nationality', 'United Kingdom');
    await chooseFilter(page, 'Sex', 'Female');

    await expect(
      page.getByText('No players match the selected filters'),
    ).toBeVisible();
    await expect(summary(page)).toHaveCount(0);
    await expect(pageSizeSelect(page)).toHaveCount(0);
    await expect(pagination(page)).toHaveCount(0);
  });
});

test.describe('Changing the view returns to the first page', () => {
  const viewChanges = [
    {
      change: 'filters by a nationality',
      start: 'page=2',
      act: (page: import('@playwright/test').Page) =>
        chooseFilter(page, 'Nationality', 'Czechia'),
      expected: 'Showing 1–24 of 24',
    },
    {
      change: 'filters by a sex',
      start: 'page=2',
      act: (page: import('@playwright/test').Page) =>
        chooseFilter(page, 'Sex', 'Male'),
      expected: 'Showing 1–25 of 60',
    },
    {
      change: 'switches the sort direction',
      start: 'page=2',
      act: (page: import('@playwright/test').Page) =>
        surnameSortButton(page).click(),
      expected: 'Showing 1–25 of 100',
    },
    {
      change: 'chooses another page size',
      start: 'page=2',
      act: (page: import('@playwright/test').Page) =>
        chooseFilter(page, 'Players per page', '10'),
      expected: 'Showing 1–10 of 100',
    },
  ];

  for (const { change, start, act, expected } of viewChanges) {
    test(`View change resets the page when the visitor ${change}`, async ({
      page,
    }) => {
      await openOverview(page, start);
      await expect(summary(page)).toHaveText(/^Showing 26–/);

      await act(page);

      await expect(summary(page)).toHaveText(expected);
      await expect(page).not.toHaveURL(/[?&]page=/);
    });
  }

  test('View change resets the page when the visitor uses Clear filters', async ({
    page,
  }) => {
    await openOverview(page, 'pageSize=10&page=2');
    await expect(summary(page)).toHaveText('Showing 11–20 of 100');
    await chooseFilter(page, 'Nationality', 'United Kingdom');
    await chooseFilter(page, 'Sex', 'Female');

    await page.getByRole('button', { name: 'Clear filters' }).click();

    await expect(summary(page)).toHaveText('Showing 1–10 of 100');
    await expect(page).not.toHaveURL(/[?&]page=/);
  });
});

test.describe('The view is kept in the URL', () => {
  test('Back and forward walk through views', async ({ page }) => {
    await openOverview(page);
    await expect(summary(page)).toHaveText('Showing 1–25 of 100');
    await pagination(page).getByRole('link', { name: 'Next' }).click();
    await expect(summary(page)).toHaveText('Showing 26–50 of 100');

    await page.goBack();
    await expect(summary(page)).toHaveText('Showing 1–25 of 100');

    await page.goForward();
    await expect(summary(page)).toHaveText('Showing 26–50 of 100');
  });

  test('Shared link opens the same view', async ({ page, browser }) => {
    await openOverview(page);
    await chooseFilter(page, 'Nationality', 'Czechia');
    await surnameSortButton(page).click();
    await chooseFilter(page, 'Players per page', '10');
    await pagination(page)
      .getByRole('link', { name: '2', exact: true })
      .click();
    await expect(summary(page)).toHaveText('Showing 11–20 of 24');
    const sharedUrl = page.url();

    const otherContext = await browser.newContext({ viewport: DESKTOP });
    const other = await otherContext.newPage();
    await useUiLanguage(other, 'en');
    await other.goto(sharedUrl);

    await expect(summary(other)).toHaveText('Showing 11–20 of 24');
    await expect(bodyRows(other)).toHaveCount(10);
    await expect(surnameHeader(other)).toHaveAttribute(
      'aria-sort',
      'descending',
    );
    expect(new Set(await shownNationalities(other))).toEqual(new Set(['CZ']));
    await otherContext.close();
  });

  test('pageSize=7 falls back to 25 players per page', async ({ page }) => {
    await openOverview(page, 'pageSize=7');

    await expect(bodyRows(page)).toHaveCount(25);
    await expect(pageSizeSelect(page)).toContainText('25');
  });

  test('page=abc falls back to page 1', async ({ page }) => {
    await openOverview(page, 'page=abc');

    await expect(summary(page)).toHaveText('Showing 1–25 of 100');
    await expect(page).not.toHaveURL(/[?&]page=/);
  });

  test('page=9 falls back to page 1 and is removed from the URL', async ({
    page,
  }) => {
    await openOverview(page, 'page=9');

    await expect(summary(page)).toHaveText('Showing 1–25 of 100');
    await expect(page).not.toHaveURL(/[?&]page=/);
    await expect(playersTable(page)).toBeVisible();
    await expect(filterSelect(page, 'Nationality')).toContainText('All');
  });
});
