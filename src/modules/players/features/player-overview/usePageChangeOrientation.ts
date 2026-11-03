import { useEffect, useRef, useState } from 'react';

import type { PlayerOverviewView } from '@/modules/players/domain/types/playerOverviewSearch';
import { isSameViewIgnoringPage } from '@/modules/players/domain/utils/isSameViewIgnoringPage';

// After the visitor changes the page (a page link, Previous/Next, back or
// forward), scroll to the top of the table, focus its caption, and announce
// the new summary. A view change also returns to page 1, but it isn't a page
// change, so it neither moves focus nor announces. Skipped on first render.
//
// `isShowingPreviousPage` holds this back while the rows of the last view stay on
// screen, so what it compares is always a view with its own rows: the search changes
// first, and the page only once the backend has answered.
export function usePageChangeOrientation(
  search: PlayerOverviewView,
  page: number,
  summary: string,
  isShowingPreviousPage: boolean,
) {
  const tableRef = useRef<HTMLTableElement>(null);
  const captionRef = useRef<HTMLTableCaptionElement>(null);
  const [announcement, setAnnouncement] = useState('');
  const previous = useRef({ search, page });

  useEffect(() => {
    if (isShowingPreviousPage) return;

    const before = previous.current;
    previous.current = { search, page };
    if (before.page === page || !isSameViewIgnoringPage(before.search, search))
      return;

    tableRef.current?.scrollIntoView({ block: 'start' });
    captionRef.current?.focus({ preventScroll: true });
    setAnnouncement(summary);
  }, [search, page, summary, isShowingPreviousPage]);

  return { tableRef, captionRef, announcement };
}
