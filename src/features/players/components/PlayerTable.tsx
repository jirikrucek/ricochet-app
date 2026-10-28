import type { Ref } from 'react';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  formatSurname,
  type Nationality,
  type Player,
} from '@/domain/players/player';
import type { SortDirection } from '@/domain/players/playerOverviewSearch';
import { Flag } from '@/localization/Flag';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip';

// Cells wrap instead of scrolling, so the table fits a 320px viewport.
const cellClassName = 'whitespace-normal wrap-break-word';

export function PlayerTableSkeleton() {
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

export function PlayerTable({
  tableRef,
  captionRef,
  rows,
  sort,
  onToggleSort,
}: {
  tableRef: Ref<HTMLTableElement>;
  captionRef: Ref<HTMLTableCaptionElement>;
  rows: Player[];
  sort: SortDirection;
  onToggleSort: () => void;
}) {
  const { t } = useTranslation();
  const SortIcon = sort === 'asc' ? ArrowUpIcon : ArrowDownIcon;
  const ariaSort = sort === 'asc' ? 'ascending' : 'descending';

  return (
    // scroll-mt keeps the table's top clear of the sticky top nav.
    <Table ref={tableRef} className="scroll-mt-nav-height table-fixed">
      <TableCaption ref={captionRef} tabIndex={-1} className="sr-only">
        {t('players.caption')}
      </TableCaption>
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
