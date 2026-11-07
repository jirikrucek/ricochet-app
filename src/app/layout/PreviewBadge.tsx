import { useTranslation } from 'react-i18next';
import { isPreviewEnvironment } from '@/config/environment';

// Marks a Preview deployment, so it can't be mistaken for Production (ADR 0013).
export function PreviewBadge() {
  const { t } = useTranslation();

  if (!isPreviewEnvironment()) {
    return null;
  }

  return (
    <span
      data-testid="preview-badge"
      className="type-caption-sm ml-sm shrink-0 rounded-full bg-primary px-sm py-xxs font-semibold text-on-primary"
    >
      {t('nav.previewBadge')}
    </span>
  );
}
