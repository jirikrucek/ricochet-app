import { getRouteApi } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { itemsPerPage } from '@/config/pagination';
import type { Nationality } from '@/modules/players/domain/types/player';
import type { PlayerOverviewPage } from '@/modules/players/domain/types/playerOverviewPage';
import type { PlayerOverviewView } from '@/modules/players/domain/types/playerOverviewSearch';
import { pageBounds } from '@/modules/players/ui/pageRange';
import { Button } from '@/ui/button';
import { usePlayerNationalities } from '@/modules/players/data-access/usePlayerNationalities';
import { usePlayersPage } from '@/modules/players/data-access/usePlayersPage';
import { PlayerFilters } from '@/modules/players/ui/PlayerFilters';
import { PlayerPagination } from '@/modules/players/ui/PlayerPagination';
import {
  PlayerTable,
  PlayerTableSkeleton,
} from '@/modules/players/ui/PlayerTable';
import { useCanonicalPage } from './useCanonicalPage';
import { usePageChangeOrientation } from './usePageChangeOrientation';

const routeApi = getRouteApi('/players/');

export function PlayerOverview() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-lg">
      <h1 className="type-display-xl m-0 text-ink">{t('players.heading')}</h1>
      <PlayerOverviewContent />
    </div>
  );
}

// Failures reach Sentry through the shared QueryCache.onError
// (docs/standards/observability-standard.md), so the states here only inform the
// visitor.
function PlayerOverviewContent() {
  const { t, i18n } = useTranslation();
  const search = routeApi.useSearch();
  const locale = i18n.resolvedLanguage ?? i18n.language;
  const nationalities = usePlayerNationalities();
  const playersPage = usePlayersPage(search, locale);

  if (nationalities.isPending || playersPage.isPending) {
    return <PlayerTableSkeleton />;
  }

  if (nationalities.isError || playersPage.isError) {
    return (
      <div role="alert" className="flex flex-col items-start gap-base">
        <p className="type-body-md m-0 text-ink">
          {t('players.error.message')}
        </p>
        <Button
          variant="outline"
          disabled={nationalities.isFetching || playersPage.isFetching}
          onClick={() => {
            if (nationalities.isError) void nationalities.refetch();
            if (playersPage.isError) void playersPage.refetch();
          }}
        >
          {t('players.error.retry')}
        </Button>
      </div>
    );
  }

  // Every player has a nationality, so none means no players at all, whatever
  // the filters say.
  if (nationalities.data.length === 0) {
    return <p className="type-body-md m-0 text-muted">{t('players.empty')}</p>;
  }

  return (
    <PlayerResults
      nationalities={nationalities.data}
      playersPage={playersPage.data}
      isShowingPreviousPage={playersPage.isPlaceholderData}
      locale={locale}
    />
  );
}

// The URL is the only view state (ADR 0002): this reads the validated search and
// turns every view change into one navigation. The rows come from the backend,
// and until those of a new view arrive, the previous ones stay on screen.
function PlayerResults({
  nationalities,
  playersPage,
  isShowingPreviousPage,
  locale,
}: {
  nationalities: Nationality[];
  playersPage: PlayerOverviewPage;
  isShowingPreviousPage: boolean;
  locale: string;
}) {
  const { t } = useTranslation();
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const { rows, total, page, pageCount } = playersPage;

  // Every view change returns to page 1 in the same navigation, so each
  // change is one history entry.
  const changeView = (change: Partial<PlayerOverviewView>) =>
    void navigate({
      search: (prev) => ({ ...prev, ...change, page: undefined }),
    });

  // The one place the "Showing X–Y of Z" text is built: the pagination shows
  // it and the page-change orientation announces it.
  const summary = t('players.pagination.summary', {
    ...pageBounds(page, itemsPerPage, total),
    total,
  });

  // The page on screen says nothing yet about the page in the URL while it is
  // only the previous view's.
  useCanonicalPage(search.page, isShowingPreviousPage ? search.page : page);
  const { tableRef, captionRef, announcement } = usePageChangeOrientation(
    search,
    page,
    summary,
    isShowingPreviousPage,
  );

  return (
    <div className="flex flex-col gap-lg" aria-busy={isShowingPreviousPage}>
      <PlayerFilters
        nationalities={nationalities}
        locale={locale}
        values={{ nationality: search.nationality, sex: search.sex }}
        onApply={changeView}
      />
      {total === 0 ? (
        <NoMatch />
      ) : (
        <>
          <PlayerTable
            tableRef={tableRef}
            captionRef={captionRef}
            rows={rows}
            sort={search.sort}
            onToggleSort={() =>
              changeView({ sort: search.sort === 'desc' ? 'asc' : 'desc' })
            }
          />
          <PlayerPagination
            page={page}
            pageCount={pageCount}
            summary={summary}
          />
        </>
      )}
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </div>
  );
}

// The applied filters and Clear all filters stay shown beside the Filters
// button, so the message needs no button of its own.
function NoMatch() {
  const { t } = useTranslation();

  return (
    <p className="type-body-md m-0 text-muted">
      {t('players.noMatch.message')}
    </p>
  );
}
