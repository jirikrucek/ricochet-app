import { createFileRoute } from '@tanstack/react-router';

import { PlayerOverview } from '../../features/players/components/PlayerOverview';

export const Route = createFileRoute('/players/')({
  component: PlayerOverview,
});
