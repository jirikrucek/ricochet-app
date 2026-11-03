import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { PlayerOverviewView } from '@/modules/players/domain/types/playerOverviewSearch';
import { fetchPlayersPage } from './api/fetchPlayersPage';

// The players change only when someone loads them by hand, so a view revisited
// within this window comes from the cache instead of the network.
const staleTime = 5 * 60 * 1000;

// The key starts with the RPC name, so the shared QueryCache.onError reports a
// failure with enough context to find it in Supabase's logs
// (docs/standards/observability-standard.md). The previous page stays on screen
// while the next one loads, so `isPlaceholderData` says whether the data is for
// this view yet.
export function usePlayersPage(view: PlayerOverviewView, language: string) {
  return useQuery({
    queryKey: ['players_sorted', language, view],
    queryFn: () => fetchPlayersPage(view, language),
    staleTime,
    placeholderData: keepPreviousData,
  });
}
