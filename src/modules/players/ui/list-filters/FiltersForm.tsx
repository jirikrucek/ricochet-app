import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, type FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { z } from 'zod';

import { Button } from '@/ui/button';
import { cn } from '@/ui/cn';
import { FilterField, type FilterDefinition } from './FilterField';

type FiltersFormProps<TValues extends Record<string, string>> = {
  filters: FilterDefinition[];
  // The applied filters, which the draft starts from.
  values: TValues;
  schema: z.ZodType<TValues>;
  // Control names equal the URL search params, so the markup is a truthful GET
  // form; React submits it through onApply instead of loading the page.
  action: string;
  onApply: (values: TValues) => void;
  className?: string;
};

// The filter draft: nothing leaves this form until Apply.
export function FiltersForm<TValues extends Record<string, string>>({
  filters,
  values,
  schema,
  action,
  onApply,
  className,
}: FiltersFormProps<TValues>) {
  const { t } = useTranslation();
  const form = useForm<FieldValues, unknown, TValues>({
    defaultValues: values,
    resolver: zodResolver(schema as z.ZodType<TValues, FieldValues>),
  });

  return (
    <form
      method="get"
      action={action}
      onSubmit={form.handleSubmit(onApply)}
      className={cn('flex flex-col gap-base', className)}
    >
      {filters.map((filter) => (
        <Controller
          key={filter.name}
          control={form.control}
          name={filter.name}
          render={({ field }) => (
            <FilterField
              filter={filter}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      ))}
      <Button type="submit" size="lg" className="h-control-lg px-lg">
        {t('listFilters.apply')}
      </Button>
    </form>
  );
}
