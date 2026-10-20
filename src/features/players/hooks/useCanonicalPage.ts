import { useEffect } from 'react';
import { getRouteApi, useRouter } from '@tanstack/react-router';

const routeApi = getRouteApi('/players/');

// A page beyond the last, or an invalid one, renders page 1 (queryPlayers).
// Once the players are loaded and the page count is known, replace the URL so
// the address bar matches what is shown, without a new history entry.
export function useCanonicalPage(requestedPage: number, effectivePage: number) {
  const router = useRouter();
  const navigate = routeApi.useNavigate();

  // Runs when the validated or effective page changes, which is after the
  // route has resolved, so the URL read here is the one being shown.
  useEffect(() => {
    const rawPage = new URLSearchParams(router.state.location.searchStr).get(
      'page',
    );
    const canonicalPage = effectivePage === 1 ? null : String(effectivePage);
    if (rawPage !== canonicalPage) {
      void navigate({
        search: (prev) => ({
          ...prev,
          page: effectivePage === 1 ? undefined : effectivePage,
        }),
        replace: true,
      });
    }
  }, [requestedPage, effectivePage, router, navigate]);
}
