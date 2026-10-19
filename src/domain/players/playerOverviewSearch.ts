import { z } from 'zod';

import { nationalitySchema, sexSchema } from './player';

// The player overview's view lives in the URL (ADR 0002). Each field falls
// back to its default on its own, so one bad param never breaks the others,
// and the route strips defaults so the default view has a clean URL.
export const sortDirections = ['asc', 'desc'] as const;
export type SortDirection = (typeof sortDirections)[number];

export const playerOverviewSearchDefaults = {
  sort: 'asc',
  nationality: 'all',
  sex: 'all',
} as const satisfies Record<string, unknown>;

export const playerOverviewSearchSchema = z.object({
  sort: z
    .enum(sortDirections)
    .default(playerOverviewSearchDefaults.sort)
    .catch(playerOverviewSearchDefaults.sort),
  nationality: z
    .union([nationalitySchema, z.literal('all')])
    .default(playerOverviewSearchDefaults.nationality)
    .catch(playerOverviewSearchDefaults.nationality),
  sex: z
    .union([sexSchema, z.literal('all')])
    .default(playerOverviewSearchDefaults.sex)
    .catch(playerOverviewSearchDefaults.sex),
});

export type PlayerOverviewView = z.output<typeof playerOverviewSearchSchema>;
