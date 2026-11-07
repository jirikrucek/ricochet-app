import { XIcon } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import type { AppliedFilter } from './appliedFilters';
import type { FilterDefinition } from './FilterField';

// What the caller's link component receives: which filters to change, as the
// values they take. The caller turns it into a link to that view.
export type FilterLinkProps<TValues extends Record<string, string>> = {
  change: Partial<TValues>;
  className?: string;
  'aria-label'?: string;
  children: ReactNode;
};

const chipClassName =
  'inline-flex items-center gap-sm rounded-full border border-hairline bg-surface-soft py-sm pr-md pl-base text-body-sm text-foreground no-underline hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none';

const clearAllClassName =
  'inline-flex items-center px-sm py-sm text-body-sm text-muted underline underline-offset-4 hover:text-ink focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none';

// One chip for each applied filter, and Clear all filters beside them. Each is
// a link to the same view without those filters.
export function AppliedFilterChips<TValues extends Record<string, string>>({
  filters,
  applied,
  FilterLink,
}: {
  filters: FilterDefinition[];
  applied: AppliedFilter[];
  FilterLink: ComponentType<FilterLinkProps<TValues>>;
}) {
  const { t } = useTranslation();
  if (applied.length === 0) return null;

  const clearAll = Object.fromEntries(
    filters.map((filter) => [filter.name, filter.allValue]),
  ) as Partial<TValues>;

  return (
    <>
      <ul
        aria-label={t('listFilters.appliedFilters')}
        className="m-0 flex list-none flex-wrap gap-sm p-0"
      >
        {applied.map(({ filter, label, text }) => (
          <li key={filter.name}>
            <FilterLink
              change={{ [filter.name]: filter.allValue } as Partial<TValues>}
              aria-label={t('listFilters.removeFilter', { name: text })}
              className={chipClassName}
            >
              {label}
              <XIcon
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />
            </FilterLink>
          </li>
        ))}
      </ul>
      <FilterLink change={clearAll} className={clearAllClassName}>
        {t('listFilters.clearAll')}
      </FilterLink>
    </>
  );
}
