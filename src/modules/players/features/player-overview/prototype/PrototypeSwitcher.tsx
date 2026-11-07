// PROTOTYPE (throwaway): floating bar to flip variants and toggle enhancement.
import { getRouteApi } from '@tanstack/react-router';
import { useEffect } from 'react';

import { variants, variantNames, type Variant } from './usePrototypeFlags';

const routeApi = getRouteApi('/players/');

export function PrototypeSwitcher({
  variant,
  enhanced,
}: {
  variant: Variant;
  enhanced: boolean;
}) {
  const navigate = routeApi.useNavigate();

  const go = (next: Variant) =>
    void navigate({
      search: (prev) => ({ ...prev, variant: next }),
      replace: true,
    });

  const step = (delta: number) =>
    go(
      variants[
        (variants.indexOf(variant) + delta + variants.length) % variants.length
      ],
    );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable]')) return;
      if (event.key === 'ArrowLeft') step(-1);
      if (event.key === 'ArrowRight') step(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (import.meta.env.PROD) return null;

  const pill =
    'rounded-full px-md py-xs text-body-sm whitespace-nowrap text-on-dark hover:bg-on-dark/20';

  return (
    <div className="fixed bottom-base left-1/2 z-50 flex -translate-x-1/2 items-center gap-sm rounded-full bg-ink px-md py-sm text-on-dark shadow-lg">
      <button type="button" className={pill} onClick={() => step(-1)}>
        ←
      </button>
      <span className="text-body-sm whitespace-nowrap">
        {variant} ({variantNames[variant]})
      </span>
      <button type="button" className={pill} onClick={() => step(1)}>
        →
      </button>
      <span className="mx-xs h-4 w-px bg-on-dark/40" />
      <button
        type="button"
        className={pill}
        onClick={() =>
          void navigate({
            search: (prev) => ({
              ...prev,
              enhance: enhanced ? 'off' : undefined,
            }),
            replace: true,
          })
        }
      >
        Enhancement: {enhanced ? 'ON' : 'OFF (baseline)'}
      </button>
    </div>
  );
}
