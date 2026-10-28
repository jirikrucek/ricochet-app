import { useQuery } from '@tanstack/react-query';

import { fetchPlayers } from '@/repositories/players/fetchPlayers';

// The query key names the table, so the shared QueryCache.onError reports a
// failure with enough context to find it in Supabase's logs
// (docs/standards/observability-standard.md).
export const playersQueryKey = ['players'] as const;

// The players change only when someone loads them by hand, so a visit within
// this window reuses the cached list instead of refetching on every mount and
// window focus.
const staleTime = 5 * 60 * 1000;

export function usePlayers() {
  return useQuery({
    queryKey: playersQueryKey,
    queryFn: () => fetchPlayers(),
    staleTime,
  });
}
