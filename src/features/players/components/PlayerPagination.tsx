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
  summary: string;
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
  summary,
  onPageSizeChange,
}: PlayerPaginationProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-base">
      <div className="flex flex-col gap-base tablet:flex-row tablet:items-end tablet:justify-between">
        <p className="type-body-md m-0 text-muted">{summary}</p>
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
      {pageCount > 1 && (
        <>
          <PageLinks page={page} pageCount={pageCount} />
          <CompactPageLinks page={page} pageCount={pageCount} />
        </>
      )}
    </div>
  );
}

// Previous and Next render as a disabled link at either end.
function PreviousItem({ page }: { page: number }) {
  const { t } = useTranslation();
  const text = t('players.pagination.previous');

  return (
    <PaginationItem>
      {page > 1 ? (
        <PaginationPrevious text={text} render={<PageLink page={page - 1} />} />
      ) : (
        <PaginationDisabled>{text}</PaginationDisabled>
      )}
    </PaginationItem>
  );
}

function NextItem({ page, pageCount }: { page: number; pageCount: number }) {
  const { t } = useTranslation();
  const text = t('players.pagination.next');

  return (
    <PaginationItem>
      {page < pageCount ? (
        <PaginationNext text={text} render={<PageLink page={page + 1} />} />
      ) : (
        <PaginationDisabled>{text}</PaginationDisabled>
      )}
    </PaginationItem>
  );
}

function PageLinks({ page, pageCount }: { page: number; pageCount: number }) {
  const { t } = useTranslation();
  return (
    <Pagination
      aria-label={t('players.pagination.label')}
      className="hidden tablet:flex"
    >
      <PaginationContent>
        <PreviousItem page={page} />
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
        <NextItem page={page} pageCount={pageCount} />
      </PaginationContent>
    </Pagination>
  );
}

// Below 744px: "Previous · Page N of M · Next". Both variants are rendered and
// switched in CSS, so the hidden one is display:none and out of the a11y tree.
function CompactPageLinks({
  page,
  pageCount,
}: {
  page: number;
  pageCount: number;
}) {
  const { t } = useTranslation();
  return (
    <Pagination
      aria-label={t('players.pagination.label')}
      className="flex tablet:hidden"
    >
      <PaginationContent className="w-full justify-between gap-xs">
        <PreviousItem page={page} />
        <PaginationItem aria-hidden="true" className="text-muted">
          ·
        </PaginationItem>
        <PaginationItem className="type-body-md text-ink">
          {t('players.pagination.pageOf', { page, count: pageCount })}
        </PaginationItem>
        <PaginationItem aria-hidden="true" className="text-muted">
          ·
        </PaginationItem>
        <NextItem page={page} pageCount={pageCount} />
      </PaginationContent>
    </Pagination>
  );
}
