import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

function TournamentsPage() {
  const { t } = useTranslation();

  return (
    <h1 className="type-display-xl m-0 text-ink">{t('nav.tournaments')}</h1>
  );
}

export const Route = createFileRoute('/tournaments/')({
  component: TournamentsPage,
});
