import { createFileRoute } from '@tanstack/react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  resolveSupportedLanguage,
  supportedLanguages,
} from '../localization/languages';
import {
  type LanguageSelectionValues,
  languageSelectionSchema,
} from '../features/language-selection/languageSelectionSchema';

function IndexPage() {
  const { i18n, t } = useTranslation();
  const activeLanguage = resolveSupportedLanguage(
    i18n.resolvedLanguage ?? i18n.language,
  );

  const { control, register } = useForm<LanguageSelectionValues>({
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
    <main>
      <label htmlFor="language">{t('app.languageLabel')}</label>
      <select id="language" {...register('language')}>
        {supportedLanguages.map((language) => (
          <option key={language} value={language}>
            {t(`languages.${language}`)}
          </option>
        ))}
      </select>

      <h1>{t('app.title')}</h1>
      <p>{t('app.bootstrapReady')}</p>
    </main>
  );
}

export const Route = createFileRoute('/')({
  component: IndexPage,
});
