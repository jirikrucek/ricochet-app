import type { ReactNode } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../ui/select';

export type FilterOption<TValue extends string> = {
  value: TValue;
  label: ReactNode;
};

type FilterSelectProps<TValue extends string> = {
  id: string;
  label: string;
  value: TValue;
  options: FilterOption<TValue>[];
  onChange: (value: TValue) => void;
};

// A labelled single-select used for each player overview filter.
export function FilterSelect<TValue extends string>({
  id,
  label,
  value,
  options,
  onChange,
}: FilterSelectProps<TValue>) {
  const selected = options.find((option) => option.value === value);

  return (
    <div className="flex w-full flex-col gap-xs tablet:w-form-field">
      <label htmlFor={id} className="type-caption text-muted">
        {label}
      </label>
      <Select
        value={value}
        onValueChange={(next) => {
          if (next) onChange(next as TValue);
        }}
      >
        <SelectTrigger id={id} size="lg" className="w-full">
          <SelectValue>{() => selected?.label}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
