import { Link } from '@tanstack/react-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { sexes, type Nationality } from '@/modules/players/domain/types/player';
import {
  all,
  playerFiltersSchema,
  type PlayerFilters as PlayerFilterValues,
} from '@/modules/players/domain/types/playerOverviewSearch';
import { Flag } from '@/shared/ui/Flag';
import {
  ListFilters,
  type FilterDefinition,
  type FilterLinkProps,
} from './list-filters/ListFilters';

type PlayerFiltersProps = {
  nationalities: Nationality[];
  locale: string;
  // The applied filters.
  values: PlayerFilterValues;
  onApply: (values: PlayerFilterValues) => void;
};

// A link to the player overview with some filters changed. It keeps every other
// search param, such as the sort direction, and drops the page: a changed
// filter starts again at page 1. The route strips default values from the URL.
function PlayerFilterLink({
  change,
  ...props
}: FilterLinkProps<PlayerFilterValues>) {
  return (
    <Link
      from="/players/"
      to="."
      search={(prev) => ({ ...prev, ...change, page: undefined })}
      {...props}
    />
  );
}

// The player overview's filters, declared for the generic filters panel.
export function PlayerFilters({
  nationalities,
  locale,
  values,
  onApply,
}: PlayerFiltersProps) {
  const { t } = useTranslation();

  const filters = useMemo<FilterDefinition[]>(() => {
    const collator = new Intl.Collator(locale, { sensitivity: 'accent' });
    const allOption = {
      value: all,
      label: t('players.filters.all'),
      text: t('players.filters.all'),
    };

    // The applied nationality stays offered even when no player has it any
    // more, so the select, the count and the chip never disagree about it.
    const offered =
      values.nationality === all || nationalities.includes(values.nationality)
        ? nationalities
        : [...nationalities, values.nationality];

    const countries = offered
      .map((nationality) => ({
        nationality,
        name: t(`countries.${nationality}`),
      }))
      .sort((a, b) => collator.compare(a.name, b.name))
      .map(({ nationality, name }) => {
        const label = (
          <>
            <Flag
              countryCode={nationality}
              aria-hidden="true"
              className="size-4 shrink-0"
            />
            {name}
          </>
        );
        return { value: nationality, label, text: name };
      });

    return [
      {
        name: 'nationality',
        label: t('players.filters.nationality'),
        allValue: all,
        options: [allOption, ...countries],
      },
      {
        name: 'sex',
        label: t('players.filters.sex'),
        allValue: all,
        options: [
          allOption,
          ...sexes.map((sex) => ({
            value: sex,
            label: t(`players.sex.${sex}`),
            text: t(`players.sex.${sex}`),
          })),
        ],
      },
    ];
  }, [nationalities, values.nationality, locale, t]);

  return (
    <ListFilters
      filters={filters}
      values={values}
      schema={playerFiltersSchema}
      action="/players"
      onApply={onApply}
      FilterLink={PlayerFilterLink}
    />
  );
}
