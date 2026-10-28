import { z } from 'zod';

import { all, orAll } from '@/lib/filter';
import { nationalitySchema, sexSchema } from './player';

// The player overview's view lives in the URL (ADR 0002). Each field falls
// back to its default on its own, so one bad param never breaks the others,
// and the route strips defaults so the default view has a clean URL.
export const sortDirections = ['asc', 'desc'] as const;
export type SortDirection = (typeof sortDirections)[number];

export const pageSizes = [10, 25, 50] as const;
export type PageSize = (typeof pageSizes)[number];

export const playerOverviewSearchDefaults = {
  sort: 'asc',
  nationality: all,
  sex: all,
  page: 1,
  pageSize: 25,
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
  // An out-of-range page is valid here; queryPlayers falls back to page 1
  // once the page count is known.
  page: z
    .number()
    .int()
    .positive()
    .default(playerOverviewSearchDefaults.page)
    .catch(playerOverviewSearchDefaults.page),
  pageSize: z
    .union(pageSizes.map((size) => z.literal(size)))
    .default(playerOverviewSearchDefaults.pageSize)
    .catch(playerOverviewSearchDefaults.pageSize),
});

export type PlayerOverviewView = z.output<typeof playerOverviewSearchSchema>;

// True when the two views differ at most in `page`. A change in any other
// field (sort, a filter, the page size) is a different view that restarts at
// page 1. Comparing every other key means a new field is covered by default.
export function isSameViewIgnoringPage(
  a: PlayerOverviewView,
  b: PlayerOverviewView,
): boolean {
  return (Object.keys(a) as (keyof PlayerOverviewView)[])
    .filter((key) => key !== 'page')
    .every((key) => a[key] === b[key]);
}
