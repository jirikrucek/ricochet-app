import { useQuery } from '@tanstack/react-query';

import { fetchPlayerNationalities } from './api/fetchPlayerNationalities';

// See usePlayersPage.
const staleTime = 5 * 60 * 1000;

export function usePlayerNationalities() {
  return useQuery({
    queryKey: ['player_nationalities'],
    queryFn: () => fetchPlayerNationalities(),
    staleTime,
  });
}
