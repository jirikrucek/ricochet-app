import { describe, expect, it } from 'vitest';

import { languageSelectionSchema } from './languageSelectionSchema';

describe('languageSelectionSchema', () => {
  it('accepts supported languages', () => {
    expect(languageSelectionSchema.parse({ language: 'en' })).toEqual({
      language: 'en',
    });
  });

  it('rejects unsupported languages', () => {
    expect(() =>
      languageSelectionSchema.parse({ language: 'fr' }),
    ).toThrowError();
  });
});
