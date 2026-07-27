import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  resolveSupportedLanguage,
  supportedLanguages,
  type SupportedLanguage,
} from '../localization/languages';
import {
  type LanguageSelectionValues,
  languageSelectionSchema,
} from '../features/language-selection/languageSelectionSchema';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

function IndexPage() {
  const { i18n, t } = useTranslation();
  const activeLanguage = resolveSupportedLanguage(
    i18n.resolvedLanguage ?? i18n.language,
  );

  const { control, setValue } = useForm<LanguageSelectionValues>({
    resolver: zodResolver(languageSelectionSchema),
    defaultValues: {
      language: activeLanguage,
    },
  });

  const selectedLanguage = useWatch({ control, name: 'language' });

  useEffect(() => {
    if (!selectedLanguage || selectedLanguage === activeLanguage) {
      return;
    }

    void i18n.changeLanguage(selectedLanguage);
  }, [activeLanguage, i18n, selectedLanguage]);

  return (
    <div className="flex flex-col" style={{ gap: 'var(--spacing-xl)' }}>
      <div className="flex flex-col" style={{ gap: 'var(--spacing-sm)' }}>
        <h1
          style={{
            fontSize: 'var(--text-display-xl)',
            fontWeight: 700,
            lineHeight: 1.43,
            color: 'var(--color-ink)',
            margin: 0,
          }}
        >
          {t('app.title')}
        </h1>
        <p
          style={{
            fontSize: 'var(--text-body-md)',
            lineHeight: 1.5,
            color: 'var(--color-muted)',
            margin: 0,
          }}
        >
          {t('app.bootstrapReady')}
        </p>
      </div>

      <div
        className="flex flex-col"
        style={{ gap: 'var(--spacing-xs)', maxWidth: '240px' }}
      >
        <label
          htmlFor="language-trigger"
          style={{
            display: 'block',
            fontSize: 'var(--text-caption)',
            fontWeight: 500,
            color: 'var(--color-muted)',
            lineHeight: 1.29,
          }}
        >
          {t('app.languageLabel')}
        </label>
        <Select
          value={selectedLanguage}
          onValueChange={(value) => {
            if (value) setValue('language', value as SupportedLanguage);
          }}
        >
          <SelectTrigger
            id="language-trigger"
            style={{
              width: '100%',
              height: '56px',
              borderRadius: 'var(--radius-sm)',
              borderColor: 'var(--color-hairline)',
              fontSize: 'var(--text-body-md)',
              color: 'var(--color-ink)',
            }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {supportedLanguages.map((language) => (
              <SelectItem key={language} value={language}>
                {t(`languages.${language}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/')({
  component: IndexPage,
});
