import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { sexes, type Nationality } from '@/modules/players/domain/types/player';
import {
  all,
  playerFiltersSchema,
  type PlayerFilters as PlayerFilterValues,
} from '@/modules/players/domain/types/playerOverviewSearch';
import { Flag } from '@/shared/ui/Flag';
import { ListFilters, type FilterDefinition } from './list-filters/ListFilters';

type PlayerFiltersProps = {
  nationalities: Nationality[];
  locale: string;
  // The applied filters.
  values: PlayerFilterValues;
  onApply: (values: PlayerFilterValues) => void;
};

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
    const allOption = { value: all, label: t('players.filters.all') };

    const countries = nationalities
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
        return { value: nationality, label };
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
          })),
        ],
      },
    ];
  }, [nationalities, locale, t]);

  return (
    <ListFilters
      filters={filters}
      values={values}
      schema={playerFiltersSchema}
      action="/players"
      onApply={onApply}
    />
  );
}
