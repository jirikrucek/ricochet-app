import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
  stripSearchParams,
} from '@tanstack/react-router';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  Nationality,
  Player,
} from '@/modules/players/domain/types/player';
import type { PlayerOverviewPage } from '@/modules/players/domain/types/playerOverviewPage';
import {
  playerOverviewSearchDefaults,
  playerOverviewSearchSchema,
  type PlayerOverviewView,
} from '@/modules/players/domain/types/playerOverviewSearch';
import { buildPlayer } from '@/modules/players/domain/types/playerMocks';
import i18n from '@/lib/i18n';
import { mockMatchMedia } from '@/shared/ui/matchMediaMocks';
import { PlayerOverview } from './PlayerOverview';

// Mock data only (docs/standards/testing-standard.md): the two data-access/api
// calls are the only external I/O, so they are the only things mocked.
const fetchPlayersPage =
  vi.fn<
    (view: PlayerOverviewView, language: string) => Promise<PlayerOverviewPage>
  >();
const fetchPlayerNationalities = vi.fn<() => Promise<Nationality[]>>();

vi.mock('@/modules/players/data-access/api/fetchPlayersPage', () => ({
  fetchPlayersPage: (view: PlayerOverviewView, language: string) =>
    fetchPlayersPage(view, language),
}));
vi.mock('@/modules/players/data-access/api/fetchPlayerNationalities', () => ({
  fetchPlayerNationalities: () => fetchPlayerNationalities(),
}));

function pageOf(
  rows: Player[],
  overrides: Partial<PlayerOverviewPage> = {},
): PlayerOverviewPage {
  return { rows, total: rows.length, page: 1, pageCount: 1, ...overrides };
}

const emptyPage = pageOf([]);

function deferred<TValue>() {
  let resolve: (value: TValue) => void = () => {};
  const promise = new Promise<TValue>((r) => (resolve = r));
  return { promise, resolve };
}

function renderPlayerOverview(path = '/players') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const rootRoute = createRootRoute({ component: Outlet });
  const playersRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/players/',
    // Same search handling as src/routes/players/index.tsx.
    validateSearch: playerOverviewSearchSchema,
    search: { middlewares: [stripSearchParams(playerOverviewSearchDefaults)] },
    component: PlayerOverview,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([playersRoute]),
    history: createMemoryHistory({ initialEntries: [path] }),
  });

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return { router };
}

let viewport: ReturnType<typeof mockMatchMedia>;

beforeEach(async () => {
  // The filters panel follows the viewport; jsdom has no matchMedia.
  viewport = mockMatchMedia(true);
  fetchPlayersPage.mockReset();
  fetchPlayerNationalities.mockReset();
  fetchPlayerNationalities.mockResolvedValue(['CZ', 'GB']);
  // jsdom doesn't implement these; the router calls the first to reset scroll
  // on every navigation, and the page change orientation the second.
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
  Element.prototype.scrollIntoView = vi.fn();
  await i18n.changeLanguage('en');
});

afterEach(() => {
  cleanup();
  viewport.restore();
});

describe('PlayerOverview states', () => {
  it('shows a loading skeleton instead of the table while players are fetched', async () => {
    fetchPlayersPage.mockReturnValue(new Promise(() => {}));

    renderPlayerOverview();

    expect(
      await screen.findByRole('status', { name: 'Loading players' }),
    ).toBeTruthy();
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('shows an error message whose Retry fetches the players again', async () => {
    fetchPlayersPage
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce(
        pageOf([buildPlayer({ firstName: 'Jana', surname: 'Nováková' })]),
      );

    renderPlayerOverview();

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain("Players couldn't be loaded.");
    expect(screen.queryByRole('table')).toBeNull();

    await act(async () => {
      fireEvent.click(within(alert).getByRole('button', { name: 'Retry' }));
    });

    expect(await screen.findByRole('cell', { name: 'Nováková' })).toBeTruthy();
    expect(fetchPlayersPage).toHaveBeenCalledTimes(2);
    expect(fetchPlayerNationalities).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows the same error when only the nationalities fail, and retries them', async () => {
    fetchPlayersPage.mockResolvedValue(
      pageOf([buildPlayer({ surname: 'Nováková' })]),
    );
    fetchPlayerNationalities
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce(['CZ']);

    renderPlayerOverview();

    const alert = await screen.findByRole('alert');
    await act(async () => {
      fireEvent.click(within(alert).getByRole('button', { name: 'Retry' }));
    });

    expect(await screen.findByRole('cell', { name: 'Nováková' })).toBeTruthy();
    expect(fetchPlayerNationalities).toHaveBeenCalledTimes(2);
    expect(fetchPlayersPage).toHaveBeenCalledTimes(1);
  });

  it.each(['/players', '/players?sex=female'])(
    'shows "No players yet" without table or pagination at %s when no players exist',
    async (path) => {
      fetchPlayersPage.mockResolvedValue(emptyPage);
      fetchPlayerNationalities.mockResolvedValue([]);

      renderPlayerOverview(path);

      expect(await screen.findByText('No players yet')).toBeTruthy();
      expect(screen.queryByRole('table')).toBeNull();
      expect(screen.queryByRole('navigation')).toBeNull();
      expect(screen.queryByText(/Showing/)).toBeNull();
      expect(
        screen.queryByText('No players match the selected filters'),
      ).toBeNull();
    },
  );
});

describe('PlayerOverview requests', () => {
  it('asks the backend for the view in the URL, in the UI language', async () => {
    fetchPlayersPage.mockResolvedValue(pageOf([buildPlayer()]));
    await i18n.changeLanguage('cs');

    renderPlayerOverview('/players?nationality=CZ&sex=female&sort=desc');
    await screen.findByRole('table');

    expect(fetchPlayersPage).toHaveBeenCalledWith(
      { nationality: 'CZ', sex: 'female', sort: 'desc', page: 1 },
      'cs',
    );
  });

  it('asks again in the new order when the UI language changes', async () => {
    fetchPlayersPage.mockResolvedValue(pageOf([buildPlayer()]));

    renderPlayerOverview();
    await screen.findByRole('table');
    await act(async () => {
      await i18n.changeLanguage('cs');
    });

    await vi.waitFor(() =>
      expect(fetchPlayersPage).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 1 }),
        'cs',
      ),
    );
    expect(screen.getByRole('table')).toBeTruthy();
  });

  it('offers no way to choose the page size', async () => {
    fetchPlayersPage.mockResolvedValue(
      pageOf([buildPlayer()], { total: 60, pageCount: 3 }),
    );

    renderPlayerOverview();
    await screen.findByRole('table');

    // The only selects on the page are the two filters in the filters panel.
    expect(screen.queryByRole('combobox')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /^Filters/ }));
    expect(screen.queryByLabelText('Players per page')).toBeNull();
    expect(screen.getAllByRole('combobox')).toHaveLength(2);
  });
});

describe('PlayerOverview with filters that match no players', () => {
  const rows = [
    buildPlayer({ surname: 'Smith', nationality: 'GB', sex: 'male' }),
    buildPlayer({ surname: 'Nováková', nationality: 'CZ', sex: 'female' }),
  ];

  beforeEach(() => {
    fetchPlayersPage.mockImplementation((view) =>
      Promise.resolve(view.nationality === 'GB' ? emptyPage : pageOf(rows)),
    );
  });

  it('shows the no-match message with the applied filters and Clear all filters instead of the table', async () => {
    renderPlayerOverview('/players?nationality=GB&sex=female');

    expect(
      await screen.findByText('No players match the selected filters'),
    ).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'Remove filter: United Kingdom' }),
    ).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'Remove filter: Female' }),
    ).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'Clear all filters' }),
    ).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Clear filters' })).toBeNull();
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('Clear all filters resets nationality and sex and keeps the sort', async () => {
    const { router } = renderPlayerOverview(
      '/players?nationality=GB&sex=female&sort=desc',
    );

    const clear = await screen.findByRole('link', {
      name: 'Clear all filters',
    });
    await act(async () => {
      fireEvent.click(clear);
    });

    expect(await screen.findByRole('cell', { name: 'Smith' })).toBeTruthy();
    expect(screen.getByRole('cell', { name: 'Nováková' })).toBeTruthy();
    expect(router.state.location.search).toEqual({ sort: 'desc' });
    expect(
      screen.queryByText('No players match the selected filters'),
    ).toBeNull();
  });

  it('names an applied nationality that no player has, so it can still be removed', async () => {
    fetchPlayerNationalities.mockResolvedValue(['CZ']);
    renderPlayerOverview('/players?nationality=GB');

    expect(
      await screen.findByRole('link', {
        name: 'Remove filter: United Kingdom',
      }),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Filters 1' })).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'Clear all filters' }),
    ).toBeTruthy();
  });

  it('a chip links to the same view without its filter, keeping the sort and dropping the page', async () => {
    renderPlayerOverview('/players?nationality=GB&sex=female&sort=desc&page=2');

    const chip = await screen.findByRole('link', {
      name: 'Remove filter: Female',
    });

    const href = new URL(chip.getAttribute('href') ?? '', 'http://localhost');
    expect(href.pathname).toBe('/players');
    expect(Object.fromEntries(href.searchParams)).toEqual({
      nationality: 'GB',
      sort: 'desc',
    });
  });
});

describe('PlayerOverview pagination ends', () => {
  beforeEach(() => {
    fetchPlayersPage.mockImplementation((view) =>
      Promise.resolve(
        pageOf([buildPlayer()], {
          total: 60,
          page: view.page,
          pageCount: 3,
        }),
      ),
    );
  });

  it('shows Previous as a disabled link on the first page', async () => {
    renderPlayerOverview('/players');

    const [previous] = await screen.findAllByText('Previous');
    expect(previous?.getAttribute('role')).toBe('link');
    expect(previous?.getAttribute('aria-disabled')).toBe('true');
    expect(previous?.hasAttribute('href')).toBe(false);
  });

  it('shows Next as a disabled link on the last page', async () => {
    renderPlayerOverview('/players?page=3');

    const [next] = await screen.findAllByText('Next');
    expect(next?.getAttribute('role')).toBe('link');
    expect(next?.getAttribute('aria-disabled')).toBe('true');
    expect(next?.hasAttribute('href')).toBe(false);
  });
});

describe('PlayerOverview canonical page', () => {
  it('keeps the page when the URL spells a valid page differently', async () => {
    fetchPlayersPage.mockImplementation((view) =>
      Promise.resolve(
        pageOf([buildPlayer({ surname: `Page${view.page}` })], {
          total: 60,
          page: view.page,
          pageCount: 3,
        }),
      ),
    );

    const { router } = renderPlayerOverview('/players?page=2.0');

    await screen.findByText('Page2');
    await vi.waitFor(() =>
      expect(router.state.location.search).toEqual({ page: 2 }),
    );
    expect(screen.getByText('Page2')).toBeTruthy();
    expect(screen.queryByText('Page1')).toBeNull();
  });

  it('removes a page beyond the last from the URL', async () => {
    // The API call answers an out-of-range page with page 1.
    fetchPlayersPage.mockImplementation(() =>
      Promise.resolve(
        pageOf([buildPlayer({ surname: 'FirstPage' })], {
          total: 60,
          page: 1,
          pageCount: 3,
        }),
      ),
    );

    const { router } = renderPlayerOverview('/players?page=9');

    await screen.findByText('FirstPage');
    await vi.waitFor(() => expect(router.state.location.search).toEqual({}));
  });
});

describe('PlayerOverview while another page loads', () => {
  const firstPage = pageOf([buildPlayer({ surname: 'FirstPage' })], {
    total: 60,
    pageCount: 3,
  });
  const secondPage = pageOf([buildPlayer({ surname: 'SecondPage' })], {
    total: 60,
    page: 2,
    pageCount: 3,
  });

  async function openFirstPageThenHoldNext() {
    const held = deferred<PlayerOverviewPage>();
    fetchPlayersPage.mockResolvedValueOnce(firstPage);
    fetchPlayersPage.mockReturnValueOnce(held.promise);
    const rendered = renderPlayerOverview();
    await screen.findByText('FirstPage');
    return { held, ...rendered };
  }

  it('keeps the previous rows and the requested URL instead of a skeleton', async () => {
    const { router } = await openFirstPageThenHoldNext();

    await act(() => router.navigate({ to: '/players', search: { page: 2 } }));

    expect(screen.getByText('FirstPage')).toBeTruthy();
    // The filters' live region is a status too, so look for the skeleton by name.
    expect(
      screen.queryByRole('status', { name: 'Loading players' }),
    ).toBeNull();
    expect(router.state.location.search).toEqual({ page: 2 });
  });

  it('orients the visitor only once the new page has arrived', async () => {
    const { held, router } = await openFirstPageThenHoldNext();
    const liveRegion = document.querySelector('[aria-live="polite"]');

    await act(() => router.navigate({ to: '/players', search: { page: 2 } }));
    expect(liveRegion?.textContent).toBe('');

    await act(async () => held.resolve(secondPage));

    await screen.findByText('SecondPage');
    expect(liveRegion?.textContent).toBe('Showing 26–50 of 60');
    expect(document.activeElement?.tagName).toBe('CAPTION');
  });

  it('does not treat a filter change as a page change', async () => {
    fetchPlayersPage.mockResolvedValueOnce(secondPage);
    const held = deferred<PlayerOverviewPage>();
    fetchPlayersPage.mockReturnValueOnce(held.promise);
    const { router } = renderPlayerOverview('/players?page=2');
    await screen.findByText('SecondPage');

    await act(() =>
      router.navigate({ to: '/players', search: { sex: 'female' } }),
    );
    await act(async () =>
      held.resolve(pageOf([buildPlayer({ surname: 'Filtered' })])),
    );

    await screen.findByText('Filtered');
    expect(document.querySelector('[aria-live="polite"]')?.textContent).toBe(
      '',
    );
    expect(document.activeElement?.tagName).not.toBe('CAPTION');
  });
});
