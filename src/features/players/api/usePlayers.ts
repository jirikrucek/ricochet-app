import { useQuery } from '@tanstack/react-query';

import { fetchPlayers } from '../../../repositories/players/fetchPlayers';

// The query key names the table, so the shared QueryCache.onError reports a
// failure with enough context to find it in Supabase's logs
// (docs/standards/observability.md).
export const playersQueryKey = ['players'] as const;

export function usePlayers() {
  return useQuery({
    queryKey: playersQueryKey,
    queryFn: () => fetchPlayers(),
  });
}
