import type { ReactNode } from 'react';

import type { FilterDefinition } from './FilterField';

export type AppliedFilter = {
  filter: FilterDefinition;
  // What the chip shows, and the same as plain text for its accessible name.
  label: ReactNode;
  text: string;
};

// The filters that narrow the list: those whose value is not their "All". The
// button's count and the chips both come from this, so they can't disagree. A
// value that no option matches, such as a nationality nobody has, still counts
// and shows as it is, so it can always be removed.
export function appliedFilters(
  filters: FilterDefinition[],
  values: Record<string, string>,
): AppliedFilter[] {
  return filters
    .filter((filter) => values[filter.name] !== filter.allValue)
    .map((filter) => {
      const value = values[filter.name] ?? '';
      const option = filter.options.find(
        (candidate) => candidate.value === value,
      );
      return {
        filter,
        label: option?.label ?? value,
        text: option?.text ?? value,
      };
    });
}
