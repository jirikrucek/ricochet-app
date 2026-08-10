import { useCallback, useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  languageMetadata,
  resolveSupportedLanguage,
  supportedLanguages,
  type SupportedLanguage,
} from './languages';
import {
  type LanguageSelectionValues,
  languageSelectionSchema,
} from './languageSelectionSchema';

export type LanguageOption = {
  value: SupportedLanguage;
  nativeName: string;
  countryCode: string;
};

export function useLanguageSelection() {
  const { i18n } = useTranslation();
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

  const options = useMemo<LanguageOption[]>(
    () =>
      supportedLanguages.map((language) => ({
        value: language,
        ...languageMetadata[language],
      })),
    [],
  );

  const onSelect = useCallback(
    (language: SupportedLanguage) => {
      setValue('language', language);
    },
    [setValue],
  );

  return { selectedLanguage, options, onSelect };
}
