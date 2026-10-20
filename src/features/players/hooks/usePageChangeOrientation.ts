import { useEffect, useRef, useState } from 'react';

import {
  isSameViewIgnoringPage,
  type PlayerOverviewView,
} from '../../../domain/players/playerOverviewSearch';

// After the visitor changes the page (a page link, Previous/Next, back or
// forward), scroll to the top of the table, focus its caption, and announce
// the new summary. A view change also returns to page 1, but it isn't a page
// change, so it neither moves focus nor announces. Skipped on first render.
export function usePageChangeOrientation(
  search: PlayerOverviewView,
  page: number,
  summary: string,
) {
  const tableRef = useRef<HTMLTableElement>(null);
  const captionRef = useRef<HTMLTableCaptionElement>(null);
  const [announcement, setAnnouncement] = useState('');
  const previous = useRef({ search, page });

  useEffect(() => {
    const before = previous.current;
    previous.current = { search, page };
    if (before.page === page || !isSameViewIgnoringPage(before.search, search))
      return;

    tableRef.current?.scrollIntoView({ block: 'start' });
    captionRef.current?.focus({ preventScroll: true });
    setAnnouncement(summary);
  }, [search, page, summary]);

  return { tableRef, captionRef, announcement };
}
