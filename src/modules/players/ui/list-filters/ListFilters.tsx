import { ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { z } from 'zod';

import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from '@/ui/popover';
import { cn } from '@/ui/cn';
import { FiltersForm } from './FiltersForm';
import type { FilterDefinition } from './FilterField';

export type { FilterDefinition, FilterOption } from './FilterField';

type ListFiltersProps<TValues extends Record<string, string>> = {
  filters: FilterDefinition[];
  // The applied filters, one value per filter name.
  values: TValues;
  schema: z.ZodType<TValues>;
  // The list's route, for the form's GET `action`.
  action: string;
  onApply: (values: TValues) => void;
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
}: ListFiltersProps<TValues>) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const appliedCount = filters.filter(
    (filter) => values[filter.name] !== filter.allValue,
  ).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={buttonClassName}>
        {t('listFilters.title')}
        {appliedCount > 0 && (
          <>
            {' '}
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
          onApply={(applied) => {
            onApply(applied);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
