import type { Player } from './player';

export type PlayerOverviewPage = {
  // The players on the effective page.
  rows: Player[];
  // Players matching the filters, across all pages.
  total: number;
  // The effective page: 1 when the requested page is beyond the last.
  page: number;
  pageCount: number;
};
