import { useId, type ReactNode } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select';

export type FilterOption = {
  value: string;
  // What the option shows in the select, such as a flag with a country name.
  label: ReactNode;
};

export type FilterDefinition = {
  // The control's name, which is also the filter's URL search param.
  name: string;
  label: string;
  // The option that means "no narrowing". It is first and the default.
  allValue: string;
  options: FilterOption[];
};

// A labelled single-select for one filter in the filters panel.
export function FilterField({
  filter,
  value,
  onChange,
}: {
  filter: FilterDefinition;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  const selected = filter.options.find((option) => option.value === value);

  return (
    <div className="flex w-full flex-col gap-xs">
      <label htmlFor={id} className="type-caption text-muted">
        {filter.label}
      </label>
      <Select
        name={filter.name}
        value={value}
        onValueChange={(next) => {
          if (next) onChange(next);
        }}
      >
        <SelectTrigger id={id} size="lg" className="w-full">
          <SelectValue>{(): ReactNode => selected?.label}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {filter.options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
