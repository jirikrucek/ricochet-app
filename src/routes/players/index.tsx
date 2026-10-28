import { createFileRoute, stripSearchParams } from '@tanstack/react-router';

import {
  playerOverviewSearchDefaults,
  playerOverviewSearchSchema,
} from '@/domain/players/playerOverviewSearch';
import { PlayerOverview } from '@/features/players/components/PlayerOverview';

export const Route = createFileRoute('/players/')({
  validateSearch: playerOverviewSearchSchema,
  // Default values never show in the URL, so the default view is `/players`.
  search: { middlewares: [stripSearchParams(playerOverviewSearchDefaults)] },
  component: PlayerOverview,
});
