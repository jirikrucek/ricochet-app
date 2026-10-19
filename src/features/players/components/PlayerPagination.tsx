import type { ComponentProps } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import {
  pageSizes,
  type PageSize,
} from '../../../domain/players/playerOverviewSearch';
import { pageRange } from '../../../lib/pageRange';
import {
  Pagination,
  PaginationContent,
  PaginationDisabled,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../../ui/pagination';
import { FilterSelect } from './FilterSelect';

type PlayerPaginationProps = {
  page: number;
  pageCount: number;
  pageSize: PageSize;
  total: number;
  onPageSizeChange: (pageSize: PageSize) => void;
};

type PageLinkProps = Omit<ComponentProps<'a'>, 'href'>;

// A page link keeps every other search param. Page 1 is dropped from the URL
// by the route's stripSearchParams.
function PageLink({ page, ...props }: { page: number } & PageLinkProps) {
  return (
    <Link
      from="/players/"
      to="."
      search={(prev) => ({ ...prev, page })}
      {...props}
    />
  );
}

export function PlayerPagination({
  page,
  pageCount,
  pageSize,
  total,
  onPageSizeChange,
}: PlayerPaginationProps) {
  const { t } = useTranslation();
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-base">
      <div className="flex flex-col gap-base tablet:flex-row tablet:items-end tablet:justify-between">
        <p className="type-body-md m-0 text-muted">
          {t('players.pagination.summary', { from, to, total })}
        </p>
        <FilterSelect
          id="player-page-size"
          label={t('players.pagination.pageSize')}
          value={String(pageSize)}
          options={pageSizes.map((size) => ({
            value: String(size),
            label: String(size),
          }))}
          onChange={(value) => onPageSizeChange(Number(value) as PageSize)}
        />
      </div>
      {pageCount > 1 && <PageLinks page={page} pageCount={pageCount} />}
    </div>
  );
}

function PageLinks({ page, pageCount }: { page: number; pageCount: number }) {
  const { t } = useTranslation();
  const previous = t('players.pagination.previous');
  const next = t('players.pagination.next');

  return (
    <Pagination aria-label={t('players.pagination.label')}>
      <PaginationContent>
        <PaginationItem>
          {page > 1 ? (
            <PaginationPrevious
              text={previous}
              render={<PageLink page={page - 1} />}
            />
          ) : (
            <PaginationDisabled>{previous}</PaginationDisabled>
          )}
        </PaginationItem>
        {pageRange(page, pageCount).map((item, index) => (
          <PaginationItem
            key={item === 'ellipsis' ? `ellipsis-${index}` : item}
          >
            {item === 'ellipsis' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                isActive={item === page}
                render={<PageLink page={item} />}
              >
                {item}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          {page < pageCount ? (
            <PaginationNext text={next} render={<PageLink page={page + 1} />} />
          ) : (
            <PaginationDisabled>{next}</PaginationDisabled>
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
