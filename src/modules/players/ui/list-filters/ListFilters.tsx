import { ChevronDownIcon } from 'lucide-react';
import { useRef, useState, type ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import type { z } from 'zod';

import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from '@/ui/popover';
import { cn } from '@/ui/cn';
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
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const applied = appliedFilters(filters, values);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { announcement, announceResult } = useFilterAnnouncement({
    resultText,
    isShowingPreviousPage,
    viewKey: JSON.stringify(values),
  });

  return (
    <div className="flex flex-wrap items-center gap-sm">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger ref={triggerRef} className={buttonClassName}>
          {t('listFilters.title')}
          {applied.length > 0 && (
            <>
              {' '}
              <span className="type-caption-sm rounded-full bg-ink px-sm py-xxs text-on-dark">
                {applied.length}
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
        </PopoverTrigger>
        <PopoverContent align="start" className="p-base">
          <PopoverTitle className="sr-only">
            {t('listFilters.title')}
          </PopoverTitle>
          <FiltersForm
            filters={filters}
            values={values}
            schema={schema}
            action={action}
            className="w-form-field"
            onApply={(newValues) => {
              const viewWillChange = filters.some(
                (filter) => newValues[filter.name] !== values[filter.name],
              );
              onApply(newValues);
              setOpen(false);
              announceResult(viewWillChange);
            }}
          />
        </PopoverContent>
      </Popover>
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
