import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

function IndexPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-xl">
      <div className="flex flex-col gap-sm">
        <h1 className="type-display-xl m-0 text-ink">{t('app.title')}</h1>
        <p className="type-body-md m-0 text-muted">{t('app.bootstrapReady')}</p>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/')({
  component: IndexPage,
});
