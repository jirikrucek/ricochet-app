// PROTOTYPE (throwaway): reads the prototype-only search params off the real
// route and hands back the clean view, so they never reach the query key.
import { getRouteApi } from '@tanstack/react-router';

const routeApi = getRouteApi('/players/');

export const variants = ['A', 'B', 'C'] as const;
export type Variant = (typeof variants)[number];

export const variantNames: Record<Variant, string> = {
  A: 'Inline panel',
  B: 'Popover',
  C: 'Sheet',
};

export function usePrototypeFlags() {
  const { variant, enhance, ...view } = routeApi.useSearch();
  return {
    variant: variant ?? 'A',
    enhanced: enhance !== 'off',
    view,
  };
}
