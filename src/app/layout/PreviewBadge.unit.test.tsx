import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '@/lib/i18n';
import { PreviewBadge } from './PreviewBadge';

describe('PreviewBadge', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
  });

  it('is shown on a Preview deployment', () => {
    vi.stubEnv('VITE_VERCEL_ENV', 'preview');
    render(<PreviewBadge />);
    expect(screen.getByTestId('preview-badge').textContent).toBe('Preview');
  });

  it.each(['production', ''])(
    'is hidden when the environment is "%s"',
    (env) => {
      vi.stubEnv('VITE_VERCEL_ENV', env);
      render(<PreviewBadge />);
      expect(screen.queryByTestId('preview-badge')).toBeNull();
    },
  );
});
