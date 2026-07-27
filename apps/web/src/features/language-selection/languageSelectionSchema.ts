import { z } from 'zod';

import { supportedLanguages } from '../../localization/languages';

export const languageSelectionSchema = z.object({
  language: z.enum(supportedLanguages),
});

export type LanguageSelectionValues = z.infer<typeof languageSelectionSchema>;
