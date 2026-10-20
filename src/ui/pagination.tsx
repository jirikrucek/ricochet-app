import * as React from 'react';
import type { VariantProps } from 'class-variance-authority';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/ui/button';

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      aria-label="pagination"
      data-slot="pagination"
      className={cn('mx-auto flex w-full justify-center', className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn('flex items-center gap-0.5', className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
  // Renders this element (for example a router link) instead of a plain <a>,
  // keeping its link semantics. The pagination props are merged onto it.
  render?: React.ReactElement<Record<string, unknown>>;
} & Pick<VariantProps<typeof buttonVariants>, 'size'> &
  React.ComponentProps<'a'>;

function PaginationLink({
  className,
  isActive,
  size = 'icon',
  render = <a />,
  ...props
}: PaginationLinkProps) {
  return React.cloneElement(render, {
    'aria-current': isActive ? 'page' : undefined,
    'data-slot': 'pagination-link',
    'data-active': isActive,
    className: cn(
      buttonVariants({ variant: isActive ? 'outline' : 'ghost', size }),
      className,
    ),
    ...props,
  });
}

// Previous/Next at either end: a link can't be disabled, so it renders as a
// non-interactive element with the link role and aria-disabled, which is how
// assistive technology announces a disabled link (a bare span's aria-disabled
// is not exposed).
function PaginationDisabled({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      role="link"
      aria-disabled="true"
      data-slot="pagination-disabled"
      className={cn(
        buttonVariants({ variant: 'ghost', size: 'default' }),
        'pointer-events-none opacity-50',
        className,
      )}
      {...props}
    />
  );
}

function PaginationPrevious({
  className,
  text = 'Previous',
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      size="default"
      className={cn('pl-1.5!', className)}
      {...props}
    >
      <ChevronLeftIcon aria-hidden="true" data-icon="inline-start" />
      <span>{text}</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  text = 'Next',
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      size="default"
      className={cn('pr-1.5!', className)}
      {...props}
    >
      <span>{text}</span>
      <ChevronRightIcon aria-hidden="true" data-icon="inline-end" />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-8 items-center justify-center [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <MoreHorizontalIcon />
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationDisabled,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
