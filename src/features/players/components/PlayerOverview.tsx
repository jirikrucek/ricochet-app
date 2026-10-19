import { useMemo } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  formatSurname,
  type Nationality,
  type Player,
} from '../../../domain/players/player';
import type {
  PlayerOverviewView,
  SortDirection,
} from '../../../domain/players/playerOverviewSearch';
import {
  presentNationalities,
  queryPlayers,
} from '../../../domain/players/queryPlayers';
import { Flag } from '../../../localization/Flag';
import { Button } from '../../../ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../../ui/tooltip';
import { usePlayers } from '../api/usePlayers';
import { FilterSelect, type FilterOption } from './FilterSelect';

const routeApi = getRouteApi('/players/');

// Cells wrap instead of scrolling, so the table fits a 320px viewport.
const cellClassName = 'whitespace-normal wrap-break-word';

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
// (docs/standards/observability.md), so the states here only inform the
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

  return <PlayerView players={players} />;
}

// The URL is the only view state (ADR 0002): this reads the validated search,
// derives the rows, and turns every view change into one navigation.
function PlayerView({ players }: { players: Player[] }) {
  const { i18n } = useTranslation();
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const locale = i18n.resolvedLanguage ?? i18n.language;

  const { rows } = useMemo(
    () => queryPlayers(players, search, locale),
    [players, search, locale],
  );

  const changeView = (change: Partial<PlayerOverviewView>) =>
    void navigate({ search: (prev) => ({ ...prev, ...change }) });

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-base tablet:flex-row">
        <NationalityFilter
          players={players}
          locale={locale}
          value={search.nationality}
          onChange={(nationality) => changeView({ nationality })}
        />
      </div>
      <PlayerTable
        rows={rows}
        sort={search.sort}
        onToggleSort={() =>
          changeView({ sort: search.sort === 'desc' ? 'asc' : 'desc' })
        }
      />
    </div>
  );
}

function NationalityFilter({
  players,
  locale,
  value,
  onChange,
}: {
  players: Player[];
  locale: string;
  value: Nationality | 'all';
  onChange: (value: Nationality | 'all') => void;
}) {
  const { t } = useTranslation();

  const options = useMemo<FilterOption<Nationality | 'all'>[]>(() => {
    const collator = new Intl.Collator(locale, { sensitivity: 'accent' });
    const countries = presentNationalities(players)
      .map((nationality) => ({
        nationality,
        name: t(`countries.${nationality}`),
      }))
      .sort((a, b) => collator.compare(a.name, b.name));

    return [
      { value: 'all', label: t('players.filters.all') },
      ...countries.map(({ nationality, name }) => ({
        value: nationality,
        label: (
          <>
            <Flag
              countryCode={nationality}
              aria-hidden="true"
              className="size-4 shrink-0"
            />
            {name}
          </>
        ),
      })),
    ];
  }, [players, locale, t]);

  return (
    <FilterSelect
      id="player-nationality-filter"
      label={t('players.filters.nationality')}
      value={value}
      options={options}
      onChange={onChange}
    />
  );
}

function PlayerTableSkeleton() {
  const { t } = useTranslation();

  return (
    <div
      role="status"
      aria-label={t('players.loading')}
      className="flex flex-col gap-md"
    >
      {Array.from({ length: 8 }, (_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="h-lg animate-pulse rounded-xs bg-surface-strong"
        />
      ))}
    </div>
  );
}

function PlayerTable({
  rows,
  sort,
  onToggleSort,
}: {
  rows: Player[];
  sort: SortDirection;
  onToggleSort: () => void;
}) {
  const { t } = useTranslation();
  const SortIcon = sort === 'asc' ? ArrowUpIcon : ArrowDownIcon;
  const ariaSort = sort === 'asc' ? 'ascending' : 'descending';

  return (
    <Table className="table-fixed">
      <TableCaption className="sr-only">{t('players.caption')}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead aria-sort={ariaSort} className={cellClassName}>
            <button
              type="button"
              onClick={onToggleSort}
              className="-mx-xs inline-flex items-center gap-xs rounded-xs px-xs text-left font-medium outline-none hover:text-ink focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {t('players.columns.surname')}
              <SortIcon
                aria-hidden="true"
                data-sort-indicator={ariaSort}
                className="size-4 shrink-0"
              />
            </button>
          </TableHead>
          <TableHead className={cellClassName}>
            {t('players.columns.firstName')}
          </TableHead>
          <TableHead className={`w-24 ${cellClassName}`}>
            {t('players.columns.nationality')}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((player) => (
          <TableRow key={player.id}>
            <TableCell className={cellClassName}>
              {formatSurname(player)}
            </TableCell>
            <TableCell className={cellClassName}>{player.firstName}</TableCell>
            <TableCell>
              <NationalityFlag nationality={player.nationality} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// A flag only, named by the localized country name. Focusable, so the tooltip
// opens on keyboard focus as well as on hover.
function NationalityFlag({ nationality }: { nationality: Nationality }) {
  const { t } = useTranslation();
  const countryName = t(`countries.${nationality}`);

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            role="img"
            aria-label={countryName}
            tabIndex={0}
            className="inline-flex rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        }
      >
        <Flag
          countryCode={nationality}
          aria-hidden="true"
          className="size-5 shrink-0"
        />
      </TooltipTrigger>
      <TooltipContent>{countryName}</TooltipContent>
    </Tooltip>
  );
}
