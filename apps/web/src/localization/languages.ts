export const defaultLanguage = 'en';

export const supportedLanguages = ['en', 'cs', 'de', 'pl', 'nl', 'hu'] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];
