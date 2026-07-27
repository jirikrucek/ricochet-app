export const defaultLanguage = 'en';

export const supportedLanguages = ['en', 'cs', 'de', 'pl', 'nl', 'hu'] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

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
