import type { ComponentProps } from 'react';

import { flagSrc } from './flags';

type FlagProps = Omit<ComponentProps<'img'>, 'src'> & {
  // ISO 3166-1 alpha-2 code, in either case.
  countryCode: string;
};

export function Flag({ countryCode, alt = '', ...props }: FlagProps) {
  return (
    <img
      src={flagSrc(countryCode)}
      alt={alt}
      data-country={countryCode.toUpperCase()}
      {...props}
    />
  );
}
