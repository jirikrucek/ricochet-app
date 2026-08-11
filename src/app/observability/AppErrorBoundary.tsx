import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Sentry } from './sentry';

function ErrorFallback() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-base px-base text-center">
      <h1 className="type-display-sm">{t('errors.unexpectedTitle')}</h1>
      <p className="type-body-md">{t('errors.unexpectedDescription')}</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-sm bg-primary px-base py-2 text-button-md text-primary-foreground"
      >
        {t('errors.reload')}
      </button>
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
