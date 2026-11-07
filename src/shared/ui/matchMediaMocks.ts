// A test helper, like playerMocks.ts: jsdom has no `window.matchMedia`, so unit
// tests of anything that follows a media query install this stand-in. It is the
// only external I/O faked, and `setMatches` plays the part of the viewport
// crossing the breakpoint.
export function mockMatchMedia(initiallyMatches: boolean) {
  let matches = initiallyMatches;
  const queries: string[] = [];
  const listeners = new Set<(event: MediaQueryListEvent) => void>();

  window.matchMedia = (query: string) => {
    queries.push(query);
    return {
      get matches() {
        return matches;
      },
      media: query,
      onchange: null,
      addEventListener: (
        _type: string,
        listener: (event: MediaQueryListEvent) => void,
      ) => listeners.add(listener),
      removeEventListener: (
        _type: string,
        listener: (event: MediaQueryListEvent) => void,
      ) => listeners.delete(listener),
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    } as MediaQueryList;
  };

  return {
    queries,
    setMatches(next: boolean) {
      matches = next;
      for (const listener of listeners) {
        listener({ matches: next } as MediaQueryListEvent);
      }
    },
  };
}
