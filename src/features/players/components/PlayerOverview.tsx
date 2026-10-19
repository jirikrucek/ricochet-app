import { useTranslation } from 'react-i18next';

import {
  formatSurname,
  type Nationality,
  type Player,
} from '../../../domain/players/player';
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

  return <PlayerTable players={players} />;
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

function PlayerTable({ players }: { players: Player[] }) {
  const { t } = useTranslation();

  return (
    <Table className="table-fixed">
      <TableCaption className="sr-only">{t('players.caption')}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className={cellClassName}>
            {t('players.columns.surname')}
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
        {players.map((player) => (
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
