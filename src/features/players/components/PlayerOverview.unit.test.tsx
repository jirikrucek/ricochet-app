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

import type { Player } from '../../../domain/players/player';
import {
  playerOverviewSearchDefaults,
  playerOverviewSearchSchema,
} from '../../../domain/players/playerOverviewSearch';
import { buildPlayer } from '../../../domain/players/playerMocks';
import i18n from '../../../localization/i18n';
import { PlayerOverview } from './PlayerOverview';

// Mock data only (docs/standards/testing.md): the players repository is the
// one piece of external I/O, so it is the only thing mocked.
const fetchPlayers = vi.fn<() => Promise<Player[]>>();

vi.mock('../../../repositories/players/fetchPlayers', () => ({
  fetchPlayers: () => fetchPlayers(),
}));

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

beforeEach(async () => {
  fetchPlayers.mockReset();
  await i18n.changeLanguage('en');
});

afterEach(() => {
  cleanup();
});

describe('PlayerOverview states', () => {
  it('shows a loading skeleton instead of the table while players are fetched', async () => {
    fetchPlayers.mockReturnValue(new Promise(() => {}));

    renderPlayerOverview();

    expect(
      await screen.findByRole('status', { name: 'Loading players' }),
    ).toBeTruthy();
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('shows an error message whose Retry fetches the players again', async () => {
    fetchPlayers
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce([
        buildPlayer({ firstName: 'Jana', surname: 'Nováková' }),
      ]);

    renderPlayerOverview();

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain("Players couldn't be loaded.");
    expect(screen.queryByRole('table')).toBeNull();

    await act(async () => {
      fireEvent.click(within(alert).getByRole('button', { name: 'Retry' }));
    });

    expect(await screen.findByRole('cell', { name: 'Nováková' })).toBeTruthy();
    expect(fetchPlayers).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows "No players yet" without table or pagination for an empty list', async () => {
    fetchPlayers.mockResolvedValue([]);

    renderPlayerOverview();

    expect(await screen.findByText('No players yet')).toBeTruthy();
    expect(screen.queryByRole('table')).toBeNull();
    expect(screen.queryByRole('navigation')).toBeNull();
    expect(screen.queryByText(/Showing/)).toBeNull();
  });
});

describe('PlayerOverview with filters that match no players', () => {
  const rows = [
    buildPlayer({ surname: 'Smith', nationality: 'GB', sex: 'male' }),
    buildPlayer({ surname: 'Nováková', nationality: 'CZ', sex: 'female' }),
  ];

  it('shows the no-match message with Clear filters instead of the table', async () => {
    fetchPlayers.mockResolvedValue(rows);

    renderPlayerOverview('/players?nationality=GB&sex=female');

    expect(
      await screen.findByText('No players match the selected filters'),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeTruthy();
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('Clear filters resets nationality and sex and keeps the sort', async () => {
    fetchPlayers.mockResolvedValue(rows);
    const { router } = renderPlayerOverview(
      '/players?nationality=GB&sex=female&sort=desc',
    );

    const clear = await screen.findByRole('button', { name: 'Clear filters' });
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
});
