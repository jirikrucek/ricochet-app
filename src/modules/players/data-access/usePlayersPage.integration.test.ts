// @vitest-environment jsdom
import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { playerOverviewSearchDefaults } from '@/modules/players/domain/types/playerOverviewSearch';
import { usePlayerNationalities } from './usePlayerNationalities';
import { usePlayersPage } from './usePlayersPage';

function wrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return {
    queryClient,
    wrapper: ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children),
  };
}

describe('usePlayersPage', () => {
  it('caches a page under the RPC name, the language and the view', async () => {
    const { queryClient, wrapper: Wrapper } = wrapper();
    const view = { ...playerOverviewSearchDefaults, sex: 'female' as const };

    const { result } = renderHook(() => usePlayersPage(view, 'cs'), {
      wrapper: Wrapper,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.total).toBe(40);
    expect(queryClient.getQueryData(['players_sorted', 'cs', view])).toBe(
      result.current.data,
    );
  });
});

describe('usePlayerNationalities', () => {
  it('caches the nationalities under the view name', async () => {
    const { queryClient, wrapper: Wrapper } = wrapper();

    const { result } = renderHook(() => usePlayerNationalities(), {
      wrapper: Wrapper,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(6);
    expect(queryClient.getQueryData(['player_nationalities'])).toBe(
      result.current.data,
    );
  });
});
