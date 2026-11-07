import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { z } from 'zod';

import {
  playerOverviewSearchDefaults,
  playerOverviewSearchSchema,
} from '@/modules/players/domain/types/playerOverviewSearch';
import { PlayerOverview } from '@/modules/players/features/player-overview/PlayerOverview';

export const Route = createFileRoute('/players/')({
  // PROTOTYPE (throwaway): variant + enhance only drive the filter prototype.
  validateSearch: playerOverviewSearchSchema.extend({
    variant: z.enum(['A', 'B', 'C']).optional().catch(undefined),
    enhance: z.literal('off').optional().catch(undefined),
  }),
  // Default values never show in the URL, so the default view is `/players`.
  search: { middlewares: [stripSearchParams(playerOverviewSearchDefaults)] },
  component: PlayerOverview,
});
