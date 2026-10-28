import { useMemo } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import type { Player } from '@/domain/players/player';
import type { PlayerOverviewView } from '@/domain/players/playerOverviewSearch';
import { queryPlayers } from '@/domain/players/queryPlayers';
import { all } from '@/lib/filter';
import { pageBounds } from '@/lib/pageRange';
import { Button } from '@/ui/button';
import { usePlayers } from '@/features/players/api/usePlayers';
import { NationalityFilter, SexFilter } from './PlayerFilters';
import { PlayerPagination } from './PlayerPagination';
import { PlayerTable, PlayerTableSkeleton } from './PlayerTable';
import { useCanonicalPage } from '@/features/players/hooks/useCanonicalPage';
import { usePageChangeOrientation } from '@/features/players/hooks/usePageChangeOrientation';

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
  const { t } = useTranslation();
  const {
    data: players,
    isPending,
    isError,
    isFetching,
    refetch,
  } = usePlayers();

  if (isPending) {
    return <PlayerTableSkeleton />;
  }

  if (isError) {
    return (
      <div role="alert" className="flex flex-col items-start gap-base">
        <p className="type-body-md m-0 text-ink">
          {t('players.error.message')}
        </p>
        <Button
          variant="outline"
          disabled={isFetching}
          onClick={() => void refetch()}
        >
          {t('players.error.retry')}
        </Button>
      </div>
    );
  }

  if (players.length === 0) {
    return <p className="type-body-md m-0 text-muted">{t('players.empty')}</p>;
  }

  return <PlayerResults players={players} />;
}

// The URL is the only view state (ADR 0002): this reads the validated search,
// derives the rows, and turns every view change into one navigation.
function PlayerResults({ players }: { players: Player[] }) {
  const { t, i18n } = useTranslation();
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const locale = i18n.resolvedLanguage ?? i18n.language;

  const { rows, total, page, pageCount } = useMemo(
    () => queryPlayers(players, search, locale),
    [players, search, locale],
  );

  // Every view change returns to page 1 in the same navigation, so each
  // change is one history entry.
  const changeView = (change: Partial<PlayerOverviewView>) =>
    void navigate({
      search: (prev) => ({ ...prev, ...change, page: undefined }),
    });

  // The one place the "Showing X–Y of Z" text is built: the pagination shows
  // it and the page-change orientation announces it.
  const summary = t('players.pagination.summary', {
    ...pageBounds(page, search.pageSize, total),
    total,
  });

  useCanonicalPage(search.page, page);
  const { tableRef, captionRef, announcement } = usePageChangeOrientation(
    search,
    page,
    summary,
  );

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-base tablet:flex-row">
        <NationalityFilter
          players={players}
          locale={locale}
          value={search.nationality}
          onChange={(nationality) => changeView({ nationality })}
        />
        <SexFilter value={search.sex} onChange={(sex) => changeView({ sex })} />
      </div>
      {total === 0 ? (
        <NoMatch
          onClearFilters={() => changeView({ nationality: all, sex: all })}
        />
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
            pageSize={search.pageSize}
            summary={summary}
            onPageSizeChange={(pageSize) => changeView({ pageSize })}
          />
        </>
      )}
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </div>
  );
}

function NoMatch({ onClearFilters }: { onClearFilters: () => void }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-start gap-base">
      <p className="type-body-md m-0 text-muted">
        {t('players.noMatch.message')}
      </p>
      <Button variant="outline" onClick={onClearFilters}>
        {t('players.noMatch.clearFilters')}
      </Button>
    </div>
  );
}
