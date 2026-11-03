import { z } from 'zod';

import { nationalitySchema, sexSchema } from './player';

// The player overview's view lives in the URL (ADR 0002). Each field falls
// back to its default on its own, so one bad param never breaks the others,
// and the route strips defaults so the default view has a clean URL.
export const sortDirections = ['asc', 'desc'] as const;
export type SortDirection = (typeof sortDirections)[number];

// A filter that is either one value or "all" (no filtering).
export const all = 'all';
export type OrAll<TValue> = TValue | typeof all;

const orAll = <TSchema extends z.ZodType>(schema: TSchema) =>
  z.union([schema, z.literal(all)]);

export const playerOverviewSearchDefaults = {
  sort: 'asc',
  nationality: all,
  sex: all,
  page: 1,
} as const satisfies Record<string, unknown>;

export const playerOverviewSearchSchema = z.object({
  sort: z
    .enum(sortDirections)
    .default(playerOverviewSearchDefaults.sort)
    .catch(playerOverviewSearchDefaults.sort),
  nationality: orAll(nationalitySchema)
    .default(playerOverviewSearchDefaults.nationality)
    .catch(playerOverviewSearchDefaults.nationality),
  sex: orAll(sexSchema)
    .default(playerOverviewSearchDefaults.sex)
    .catch(playerOverviewSearchDefaults.sex),
  // An out-of-range page is valid here; fetchPlayersPage falls back to page 1
  // once the backend knows the total.
  page: z
    .number()
    .int()
    .positive()
    .default(playerOverviewSearchDefaults.page)
    .catch(playerOverviewSearchDefaults.page),
});

export type PlayerOverviewView = z.output<typeof playerOverviewSearchSchema>;
