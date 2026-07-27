import { useTranslation } from 'react-i18next';

export function AppFooter() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-hairline bg-canvas px-base py-lg">
      <div className="type-caption-sm mx-auto max-w-app-shell text-muted">
        {t('footer.legal', { year })}
      </div>
    </footer>
  );
}
