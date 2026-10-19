// @vitest-environment jsdom
import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { usePlayers } from './usePlayers';

function renderUsePlayers() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  return { queryClient, ...renderHook(() => usePlayers(), { wrapper }) };
}

describe('usePlayers', () => {
  it('returns the seeded players mapped to domain players', async () => {
    const { result } = renderUsePlayers();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(100);
    expect(result.current.data).toContainEqual({
      id: expect.any(Number),
      firstName: 'Pieter',
      surnamePrefix: 'de',
      surname: 'Vries',
      nationality: 'NL',
      sex: 'male',
    });
  });

  it("caches the players under the query key ['players']", async () => {
    const { result, queryClient } = renderUsePlayers();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryData(['players'])).toBe(result.current.data);
  });
});
