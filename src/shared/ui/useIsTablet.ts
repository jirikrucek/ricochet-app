import { useSyncExternalStore } from 'react';

// Read from the `tablet` breakpoint token in globals.css, so everything that
// reacts to it changes at exactly the width where the layout does.
export function tabletMediaQuery() {
  const width = getComputedStyle(document.documentElement)
    .getPropertyValue('--breakpoint-tablet')
    .trim();
  return `(min-width: ${width})`;
}

function subscribe(onChange: () => void) {
  const tablet = window.matchMedia(tabletMediaQuery());
  tablet.addEventListener('change', onChange);
  return () => tablet.removeEventListener('change', onChange);
}

const isTablet = () => window.matchMedia(tabletMediaQuery()).matches;

// True while the viewport is at least as wide as the tablet breakpoint, and
// re-renders when it crosses it.
export function useIsTablet() {
  return useSyncExternalStore(subscribe, isTablet);
}
