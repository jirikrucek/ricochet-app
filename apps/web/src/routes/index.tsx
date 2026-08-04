import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  languageMetadata,
  resolveSupportedLanguage,
  supportedLanguages,
  type SupportedLanguage,
} from '../localization/languages';
import {
  type LanguageSelectionValues,
  languageSelectionSchema,
} from '../features/language-selection/languageSelectionSchema';
import { LanguageOption } from '../features/language-selection/LanguageOption';
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
    <div className="flex flex-col gap-xl">
      <div className="flex flex-col gap-sm">
        <h1 className="type-display-xl m-0 text-ink">{t('app.title')}</h1>
        <p className="type-body-md m-0 text-muted">{t('app.bootstrapReady')}</p>
      </div>

      <div className="flex max-w-form-field flex-col gap-xs">
        <label
          htmlFor="language-trigger"
          className="type-caption block text-muted"
        >
          {t('app.languageLabel')}
        </label>
        <Select
          value={selectedLanguage}
          onValueChange={(value) => {
            if (value) setValue('language', value as SupportedLanguage);
          }}
        >
          <SelectTrigger id="language-trigger" size="lg" className="w-full">
            <SelectValue>
              {(value: SupportedLanguage) => (
                <LanguageOption {...languageMetadata[value]} />
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {supportedLanguages.map((language) => (
              <SelectItem key={language} value={language}>
                <LanguageOption {...languageMetadata[language]} />
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
