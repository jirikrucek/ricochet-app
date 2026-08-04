export const defaultLanguage = 'en';

export const supportedLanguages = ['en', 'cs', 'de', 'pl', 'nl', 'hu'] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

export const languageMetadata: Record<
  SupportedLanguage,
  { nativeName: string; countryCode: string }
> = {
  en: { nativeName: 'English', countryCode: 'gb' },
  cs: { nativeName: 'Čeština', countryCode: 'cz' },
  de: { nativeName: 'Deutsch', countryCode: 'de' },
  pl: { nativeName: 'Polski', countryCode: 'pl' },
  nl: { nativeName: 'Nederlands', countryCode: 'nl' },
  hu: { nativeName: 'Magyar', countryCode: 'hu' },
};

export function resolveSupportedLanguage(
  language: string | undefined,
): SupportedLanguage {
  if (!language) {
    return defaultLanguage;
  }

  if (supportedLanguages.includes(language as SupportedLanguage)) {
    return language as SupportedLanguage;
  }

  return defaultLanguage;
}
