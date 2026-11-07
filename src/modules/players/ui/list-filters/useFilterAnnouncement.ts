import { useCallback, useEffect, useRef, useState } from 'react';

type FilterAnnouncementInput = {
  // What a visitor should hear about the list as it is now.
  resultText: string;
  // True while the rows of the previous view are still on screen: the search
  // has changed, and the rows follow once the backend has answered.
  isShowingPreviousPage: boolean;
  // Changes whenever the applied filters do.
  viewKey: string;
};

// How long a request waits for its navigation before it is forgotten, so a
// navigation that never happened can't claim a later, unrelated change.
const requestExpiry = 2000;
// How long an announcement stays in the live region, so it isn't left stale.
const announcementLifetime = 10_000;
// A live region only speaks when its text changes: it is cleared first and set
// a moment later, so the same text said twice is heard twice.
const speakDelay = 50;

type Request = {
  // The view the visitor was on when they changed filters.
  from: string;
  // True once the navigation to the new view has happened.
  bound: boolean;
};

// The announcement made after the visitor changes filters: the result, once the
// rows of the new view are shown. A view that changed without the visitor
// using the filters, such as going back, announces nothing.
export function useFilterAnnouncement({
  resultText,
  isShowingPreviousPage,
  viewKey,
}: FilterAnnouncementInput) {
  const [announcement, setAnnouncement] = useState('');
  const request = useRef<Request | null>(null);
  const latest = useRef({ resultText, viewKey });
  const speakTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const clearTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const expiryTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    latest.current = { resultText, viewKey };
  });
  useEffect(
    () => () => {
      clearTimeout(speakTimer.current);
      clearTimeout(clearTimer.current);
      clearTimeout(expiryTimer.current);
    },
    [],
  );

  // Clears first and sets a moment later, all in timers, so it can be called
  // from an effect.
  const say = useCallback((text: string) => {
    clearTimeout(speakTimer.current);
    clearTimeout(clearTimer.current);
    clearTimer.current = setTimeout(() => setAnnouncement(''), 0);
    speakTimer.current = setTimeout(() => {
      setAnnouncement(text);
      clearTimer.current = setTimeout(
        () => setAnnouncement(''),
        announcementLifetime,
      );
    }, speakDelay);
  }, []);

  useEffect(() => {
    const pending = request.current;
    if (!pending) return;
    if (!pending.bound) {
      // Only a change of view can answer the request: a refetch of the old one
      // is not it.
      if (viewKey === pending.from) return;
      pending.bound = true;
      clearTimeout(expiryTimer.current);
    }
    if (isShowingPreviousPage) return;
    request.current = null;
    say(resultText);
  }, [resultText, isShowingPreviousPage, viewKey, say]);

  // Call it when the visitor has changed filters. When the view is about to
  // change, the announcement waits for its rows. When nothing will change,
  // there is nothing to wait for.
  const announceResult = useCallback(
    (viewWillChange: boolean) => {
      clearTimeout(expiryTimer.current);
      if (!viewWillChange) {
        request.current = null;
        // From a click, so the old text can go at once.
        setAnnouncement('');
        say(latest.current.resultText);
        return;
      }
      request.current = { from: latest.current.viewKey, bound: false };
      expiryTimer.current = setTimeout(() => {
        if (request.current && !request.current.bound) request.current = null;
      }, requestExpiry);
    },
    [say],
  );

  return { announcement, announceResult };
}
