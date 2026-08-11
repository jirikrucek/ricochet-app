import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  languageMetadata,
  resolveSupportedLanguage,
  supportedLanguages,
  type SupportedLanguage,
} from '../languages';

export type LanguageOption = {
  value: SupportedLanguage;
  nativeName: string;
  countryCode: string;
};

export function useLanguageSelection() {
  const { i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(() =>
    resolveSupportedLanguage(i18n.resolvedLanguage ?? i18n.language),
  );

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
      setSelectedLanguage((current) => {
        if (language === current) {
          return current;
        }

        void i18n.changeLanguage(language);
        return language;
      });
    },
    [i18n],
  );

  return { selectedLanguage, options, onSelect };
}
