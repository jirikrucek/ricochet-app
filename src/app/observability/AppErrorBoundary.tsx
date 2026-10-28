import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Sentry } from '@/lib/sentry';
import { Button } from '@/ui/button';

function ErrorFallback() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-base px-base text-center">
      <h1 className="type-display-sm">{t('errors.unexpectedTitle')}</h1>
      <p className="type-body-md">{t('errors.unexpectedDescription')}</p>
      <Button
        className="h-auto rounded-sm px-base! py-sm type-button-md"
        onClick={() => window.location.reload()}
      >
        {t('errors.reload')}
      </Button>
    </div>
  );
}

export function AppErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
      {children}
    </Sentry.ErrorBoundary>
  );
}
