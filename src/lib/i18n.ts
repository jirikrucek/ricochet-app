import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import { defaultLanguage, supportedLanguages } from '@/locales/languages';
import { resources } from '@/locales/resources';

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: defaultLanguage,
    supportedLngs: supportedLanguages,
    load: 'languageOnly',
    interpolation: {
      // React escapes text and attributes itself, and this relies on that: revisit
      // it before an interpolated string reaches <Trans> with HTML,
      // dangerouslySetInnerHTML or innerHTML.
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
