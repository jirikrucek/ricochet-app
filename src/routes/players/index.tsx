import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

function PlayersPage() {
  const { t } = useTranslation();

  return <h1 className="type-display-xl m-0 text-ink">{t('nav.players')}</h1>;
}

export const Route = createFileRoute('/players/')({
  component: PlayersPage,
});
