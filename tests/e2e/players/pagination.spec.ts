import { expect, test, type Page } from '@playwright/test';

import {
  DESKTOP,
  bodyRows,
  chooseFilter,
  filterSelect,
  openOverview,
  pagination,
  paginationText,
  playersTable,
  pretendPlayerCount,
  summary,
  surnameHeader,
  surnameSortButton,
  useUiLanguage,
} from './overview';

test.use({ viewport: DESKTOP });

test.beforeEach(async ({ page }) => {
  await useUiLanguage(page, 'en');
});

test.describe('Player overview is paginated with a fixed page size', () => {
  test('First page', async ({ page }) => {
    await openOverview(page);

    await expect(bodyRows(page)).toHaveCount(25);
    await expect(summary(page)).toHaveText('Showing 1–25 of 100');
  });

  test('Last page shows the remaining players', async ({ page }) => {
    await openOverview(page, 'sex=female');
    await expect(summary(page)).toHaveText('Showing 1–25 of 40');

    await pagination(page).getByRole('link', { name: 'Next' }).click();

    await expect(bodyRows(page)).toHaveCount(15);
    await expect(summary(page)).toHaveText('Showing 26–40 of 40');
  });

  test('Page size cannot be chosen', async ({ page }) => {
    await openOverview(page);
    await expect(summary(page)).toHaveText('Showing 1–25 of 100');

    await expect(page.getByRole('main').getByRole('combobox')).toHaveCount(2);
    await expect(filterSelect(page, 'Players per page')).toHaveCount(0);
    await expect(page.getByText('Players per page')).toHaveCount(0);
  });

  test('Summary counts only filtered players', async ({ page }) => {
    await openOverview(page);

    await chooseFilter(page, 'Sex', 'Female');

    await expect(summary(page)).toHaveText('Showing 1–25 of 40');
  });
});

test.describe('Only the shown page of players is loaded', () => {
  // How many players the browser received, per players request.
  function receivedPlayers(page: Page) {
    const received: number[] = [];
    page.on('response', async (response) => {
      if (response.url().includes('/rest/v1/rpc/players_sorted')) {
        received.push(((await response.json()) as unknown[]).length);
      }
    });
    return received;
  }

  test('Opening the overview loads one page', async ({ page }) => {
    const received = receivedPlayers(page);

    await openOverview(page);
    await expect(summary(page)).toHaveText('Showing 1–25 of 100');

    await expect.poll(() => received).toEqual([25]);
  });

  test('Filtering is answered by the backend', async ({ page }) => {
    await openOverview(page);
    await expect(summary(page)).toHaveText('Showing 1–25 of 100');
    const received = receivedPlayers(page);

    const request = page.waitForRequest(
      (r) =>
        r.url().includes('/rest/v1/rpc/players_sorted') &&
        r.url().includes('nationality=eq.HU'),
    );
    await chooseFilter(page, 'Nationality', 'Hungary');
    await request;

    await expect(summary(page)).toHaveText('Showing 1–4 of 4');
    await expect.poll(() => received).toEqual([4]);
  });
});

test.describe('Page links show a compact page range on wide screens', () => {
  // 100 seeded players at 25 per page never produce an ellipsis, so these
  // need more players than the seed holds.
  test('First page of several', async ({ page }) => {
    await pretendPlayerCount(page, 250);
    await openOverview(page);
    await expect(summary(page)).toHaveText('Showing 1–25 of 250');

    expect(await paginationText(page)).toBe('Previous 1 2 … 10 Next');
    await expect(
      pagination(page).getByRole('link', { name: '1', exact: true }),
    ).toHaveAttribute('aria-current', 'page');
    await expect(
      pagination(page).getByText('Previous', { exact: true }),
    ).toHaveAttribute('aria-disabled', 'true');
    await expect(
      pagination(page).getByRole('link', { name: 'Previous' }),
    ).not.toHaveAttribute('href');
  });

  test('Last page disables Next', async ({ page }) => {
    await pretendPlayerCount(page, 250);
    await openOverview(page, 'page=10');
    await expect(summary(page)).toHaveText('Showing 226–250 of 250');

    expect(await paginationText(page)).toBe('Previous 1 … 9 10 Next');
    await expect(
      pagination(page).getByRole('link', { name: '10', exact: true }),
    ).toHaveAttribute('aria-current', 'page');
    await expect(
      pagination(page).getByText('Next', { exact: true }),
    ).toHaveAttribute('aria-disabled', 'true');
    await expect(
      pagination(page).getByRole('link', { name: 'Next' }),
    ).not.toHaveAttribute('href');
  });

  test('Gaps collapse into ellipses', async ({ page }) => {
    await pretendPlayerCount(page, 250);
    await openOverview(page, 'page=5');
    await expect(summary(page)).toHaveText('Showing 101–125 of 250');

    expect(await paginationText(page)).toBe('Previous 1 … 4 5 6 … 10 Next');
  });

  test('One-page gap shows the page number', async ({ page }) => {
    await openOverview(page);
    await expect(summary(page)).toHaveText('Showing 1–25 of 100');

    expect(await paginationText(page)).toBe('Previous 1 2 3 4 Next');
  });

  test('Going to a numbered page', async ({ page }) => {
    await pretendPlayerCount(page, 250);
    await openOverview(page);

    await pagination(page)
      .getByRole('link', { name: '10', exact: true })
      .click();

    await expect(summary(page)).toHaveText('Showing 226–250 of 250');
  });
});

test.describe('Pagination hides what does not apply', () => {
  test('One page of results', async ({ page }) => {
    await openOverview(page);

    await chooseFilter(page, 'Nationality', 'Hungary');

    await expect(summary(page)).toHaveText('Showing 1–4 of 4');
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
    await expect(pagination(page)).toHaveCount(0);
  });
});

test.describe('Changing the view returns to the first page', () => {
  const viewChanges = [
    {
      change: 'filters by a nationality',
      start: 'page=2',
      act: (page: Page) => chooseFilter(page, 'Nationality', 'Czechia'),
      expected: 'Showing 1–24 of 24',
    },
    {
      change: 'filters by a sex',
      start: 'page=2',
      act: (page: Page) => chooseFilter(page, 'Sex', 'Male'),
      expected: 'Showing 1–25 of 60',
    },
    {
      change: 'switches the sort direction',
      start: 'page=2',
      act: (page: Page) => surnameSortButton(page).click(),
      expected: 'Showing 1–25 of 100',
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
    await openOverview(page, 'page=2');
    await expect(summary(page)).toHaveText('Showing 26–50 of 100');
    await chooseFilter(page, 'Nationality', 'United Kingdom');
    await chooseFilter(page, 'Sex', 'Female');

    await page.getByRole('button', { name: 'Clear filters' }).click();

    await expect(summary(page)).toHaveText('Showing 1–25 of 100');
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
    await chooseFilter(page, 'Sex', 'Female');
    await expect(summary(page)).toHaveText('Showing 1–25 of 40');
    await surnameSortButton(page).click();
    await expect(surnameHeader(page)).toHaveAttribute(
      'aria-sort',
      'descending',
    );
    await pagination(page)
      .getByRole('link', { name: '2', exact: true })
      .click();
    await expect(summary(page)).toHaveText('Showing 26–40 of 40');
    const sharedUrl = page.url();

    const otherContext = await browser.newContext({ viewport: DESKTOP });
    const other = await otherContext.newPage();
    await useUiLanguage(other, 'en');
    await other.goto(sharedUrl);

    await expect(summary(other)).toHaveText('Showing 26–40 of 40');
    await expect(bodyRows(other)).toHaveCount(15);
    await expect(surnameHeader(other)).toHaveAttribute(
      'aria-sort',
      'descending',
    );
    await expect(filterSelect(other, 'Sex')).toContainText('Female');
    await otherContext.close();
  });

  test('pageSize=50 shows 25 players per page', async ({ page }) => {
    await openOverview(page, 'pageSize=50');

    await expect(bodyRows(page)).toHaveCount(25);
    await expect(summary(page)).toHaveText('Showing 1–25 of 100');

    await pagination(page).getByRole('link', { name: 'Next' }).click();

    await expect(summary(page)).toHaveText('Showing 26–50 of 100');
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
