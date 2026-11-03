import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  sexes,
  type Nationality,
  type Sex,
} from '@/modules/players/domain/types/player';
import {
  all,
  type OrAll,
} from '@/modules/players/domain/types/playerOverviewSearch';
import { Flag } from '@/shared/ui/Flag';
import { FilterSelect, type FilterOption } from './FilterSelect';

export function SexFilter({
  value,
  onChange,
}: {
  value: OrAll<Sex>;
  onChange: (value: OrAll<Sex>) => void;
}) {
  const { t } = useTranslation();
  const options: FilterOption<OrAll<Sex>>[] = [
    { value: all, label: t('players.filters.all') },
    ...sexes.map((sex) => ({ value: sex, label: t(`players.sex.${sex}`) })),
  ];

  return (
    <FilterSelect
      id="player-sex-filter"
      label={t('players.filters.sex')}
      value={value}
      options={options}
      onChange={onChange}
    />
  );
}

export function NationalityFilter({
  nationalities,
  locale,
  value,
  onChange,
}: {
  nationalities: Nationality[];
  locale: string;
  value: OrAll<Nationality>;
  onChange: (value: OrAll<Nationality>) => void;
}) {
  const { t } = useTranslation();

  const options = useMemo<FilterOption<OrAll<Nationality>>[]>(() => {
    const collator = new Intl.Collator(locale, { sensitivity: 'accent' });
    const countries = nationalities
      .map((nationality) => ({
        nationality,
        name: t(`countries.${nationality}`),
      }))
      .sort((a, b) => collator.compare(a.name, b.name));

    return [
      { value: all, label: t('players.filters.all') },
      ...countries.map(({ nationality, name }) => ({
        value: nationality,
        label: (
          <>
            <Flag
              countryCode={nationality}
              aria-hidden="true"
              className="size-4 shrink-0"
            />
            {name}
          </>
        ),
      })),
    ];
  }, [nationalities, locale, t]);

  return (
    <FilterSelect
      id="player-nationality-filter"
      label={t('players.filters.nationality')}
      value={value}
      options={options}
      onChange={onChange}
    />
  );
}
