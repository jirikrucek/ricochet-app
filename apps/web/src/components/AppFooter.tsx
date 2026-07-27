import { useTranslation } from 'react-i18next';

export function AppFooter() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer
      className="w-full border-t"
      style={{
        backgroundColor: 'var(--color-canvas)',
        borderColor: 'var(--color-hairline)',
        paddingBlock: 'var(--spacing-lg)',
        paddingInline: 'var(--spacing-base)',
      }}
    >
      <div
        className="mx-auto max-w-[1280px]"
        style={{
          color: 'var(--color-muted)',
          fontSize: 'var(--text-caption-sm)',
          lineHeight: 1.23,
        }}
      >
        {t('footer.legal', { year })}
      </div>
    </footer>
  );
}
