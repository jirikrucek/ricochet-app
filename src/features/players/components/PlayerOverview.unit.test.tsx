import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
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

import type { PlayerRowInput } from '../../../domain/players/player';
import { buildPlayerRow } from '../../../domain/players/playerMocks';
import i18n from '../../../localization/i18n';
import { PlayerOverview } from './PlayerOverview';

// Mock data only (docs/standards/testing.md): the Supabase call is the one
// piece of external I/O, so it is the only thing mocked.
const fetchPlayerRows = vi.fn<() => Promise<PlayerRowInput[]>>();

vi.mock('../../../client-api/players/fetchPlayerRows', () => ({
  fetchPlayerRows: () => fetchPlayerRows(),
}));

function renderPlayerOverview(path = '/players') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const rootRoute = createRootRoute({ component: Outlet });
  const playersRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/players/',
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
  fetchPlayerRows.mockReset();
  await i18n.changeLanguage('en');
});

afterEach(() => {
  cleanup();
});

describe('PlayerOverview states', () => {
  it('shows a loading skeleton instead of the table while players are fetched', async () => {
    fetchPlayerRows.mockReturnValue(new Promise(() => {}));

    renderPlayerOverview();

    expect(
      await screen.findByRole('status', { name: 'Loading players' }),
    ).toBeTruthy();
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('shows an error message whose Retry fetches the players again', async () => {
    fetchPlayerRows
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce([
        buildPlayerRow({ first_name: 'Jana', surname: 'Nováková' }),
      ]);

    renderPlayerOverview();

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain("Players couldn't be loaded.");
    expect(screen.queryByRole('table')).toBeNull();

    await act(async () => {
      fireEvent.click(within(alert).getByRole('button', { name: 'Retry' }));
    });

    expect(await screen.findByRole('cell', { name: 'Nováková' })).toBeTruthy();
    expect(fetchPlayerRows).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows "No players yet" without table or pagination for an empty list', async () => {
    fetchPlayerRows.mockResolvedValue([]);

    renderPlayerOverview();

    expect(await screen.findByText('No players yet')).toBeTruthy();
    expect(screen.queryByRole('table')).toBeNull();
    expect(screen.queryByRole('navigation')).toBeNull();
    expect(screen.queryByText(/Showing/)).toBeNull();
  });
});
