import { ChevronDownIcon } from 'lucide-react';
import { useRef, useState, type ComponentType, type RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import type { z } from 'zod';

import { useIsTablet } from '@/shared/ui/useIsTablet';
import { cn } from '@/ui/cn';
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from '@/ui/popover';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/ui/sheet';
import { AppliedFilterChips, type FilterLinkProps } from './AppliedFilterChips';
import { appliedFilters } from './appliedFilters';
import { useFilterAnnouncement } from './useFilterAnnouncement';
import { FiltersForm } from './FiltersForm';
import type { FilterDefinition } from './FilterField';

export type { FilterDefinition, FilterOption } from './FilterField';
export type { FilterLinkProps } from './AppliedFilterChips';

type ListFiltersProps<TValues extends Record<string, string>> = {
  filters: FilterDefinition[];
  // The applied filters, one value per filter name.
  values: TValues;
  schema: z.ZodType<TValues>;
  // The list's route, for the form's GET `action`.
  action: string;
  onApply: (values: TValues) => void;
  // Renders a link to the list with some filters changed, for the chips.
  FilterLink: ComponentType<FilterLinkProps<TValues>>;
  // What to announce about the list after a filter change.
  resultText: string;
  // True while the rows of the previous view are still on screen.
  isShowingPreviousPage: boolean;
};

const buttonClassName =
  'group/filters inline-flex h-control-lg w-fit cursor-pointer items-center gap-sm rounded-full border border-input bg-background px-lg text-body-md text-foreground outline-none select-none hover:bg-accent focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50';

// The Filters button and the panel it opens. The panel is a popover from the
// tablet breakpoint upward and a sheet from the bottom edge below it. The caller
// keys this by that choice, so a change of viewport remounts it closed, which
// also drops the draft.
function FiltersOverlay<TValues extends Record<string, string>>({
  isTablet,
  triggerRef,
  appliedCount,
  filters,
  values,
  schema,
  action,
  onApply,
}: {
  isTablet: boolean;
  triggerRef: RefObject<HTMLButtonElement | null>;
  appliedCount: number;
  filters: FilterDefinition[];
  values: TValues;
  schema: z.ZodType<TValues>;
  action: string;
  onApply: (values: TValues) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const buttonContent = (
    <>
      {t('listFilters.title')}
      {appliedCount > 0 && (
        <>
          {/* The space gives the button the name "Filters 2", not "Filters2". */}{' '}
          <span className="type-caption-sm rounded-full bg-ink px-sm py-xxs text-on-dark">
            {appliedCount}
          </span>
        </>
      )}
      <ChevronDownIcon
        aria-hidden="true"
        className={cn(
          'size-4 text-muted-foreground transition-transform',
          'group-data-popup-open/filters:rotate-180',
        )}
      />
    </>
  );

  const form = (className: string) => (
    <FiltersForm
      filters={filters}
      values={values}
      schema={schema}
      action={action}
      className={className}
      onApply={(newValues) => {
        onApply(newValues);
        setOpen(false);
      }}
    />
  );

  if (isTablet) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger ref={triggerRef} className={buttonClassName}>
          {buttonContent}
        </PopoverTrigger>
        <PopoverContent align="start" className="p-base">
          <PopoverTitle className="sr-only">
            {t('listFilters.title')}
          </PopoverTitle>
          {form('w-form-field')}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger ref={triggerRef} className={buttonClassName}>
        {buttonContent}
      </SheetTrigger>
      <SheetContent
        side="bottom"
        closeLabel={t('listFilters.close')}
        className="max-h-svh overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>{t('listFilters.title')}</SheetTitle>
          <SheetDescription>{t('listFilters.description')}</SheetDescription>
        </SheetHeader>
        {form('px-base pb-base')}
      </SheetContent>
    </Sheet>
  );
}

// One Filters button that opens a panel with a select per filter and Apply. It
// knows nothing about the list: the caller declares the filters and takes the
// applied values.
export function ListFilters<TValues extends Record<string, string>>({
  filters,
  values,
  schema,
  action,
  onApply,
  FilterLink,
  resultText,
  isShowingPreviousPage,
}: ListFiltersProps<TValues>) {
  const isTablet = useIsTablet();
  const applied = appliedFilters(filters, values);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { announcement, announceResult } = useFilterAnnouncement({
    resultText,
    isShowingPreviousPage,
    viewKey: JSON.stringify(values),
  });

  return (
    <div className="flex flex-wrap items-center gap-sm">
      <FiltersOverlay
        key={isTablet ? 'popover' : 'sheet'}
        isTablet={isTablet}
        triggerRef={triggerRef}
        appliedCount={applied.length}
        filters={filters}
        values={values}
        schema={schema}
        action={action}
        onApply={(newValues) => {
          const viewWillChange = filters.some(
            (filter) => newValues[filter.name] !== values[filter.name],
          );
          onApply(newValues);
          announceResult(viewWillChange);
        }}
      />
      <AppliedFilterChips
        filters={filters}
        applied={applied}
        FilterLink={FilterLink}
        onUse={() => {
          // The chip goes away with the change, so focus would be lost.
          triggerRef.current?.focus();
          announceResult(true);
        }}
      />
      <div role="status" className="sr-only">
        {announcement}
      </div>
    </div>
  );
}
