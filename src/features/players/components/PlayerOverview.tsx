import { useTranslation } from 'react-i18next';

import {
  formatSurname,
  type Nationality,
  type Player,
} from '../../../domain/players/player';
import { Flag } from '../../../localization/Flag';
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
  const { data: players = [] } = usePlayers();

  return (
    <div className="flex flex-col gap-lg">
      <h1 className="type-display-xl m-0 text-ink">{t('players.heading')}</h1>
      <PlayerTable players={players} />
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
