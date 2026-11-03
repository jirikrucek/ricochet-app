import { createFileRoute, stripSearchParams } from '@tanstack/react-router';

import {
  playerOverviewSearchDefaults,
  playerOverviewSearchSchema,
} from '@/modules/players/domain/types/playerOverviewSearch';
import { PlayerOverview } from '@/modules/players/features/player-overview/PlayerOverview';

export const Route = createFileRoute('/players/')({
  validateSearch: playerOverviewSearchSchema,
  // Default values never show in the URL, so the default view is `/players`.
  search: { middlewares: [stripSearchParams(playerOverviewSearchDefaults)] },
  component: PlayerOverview,
});
