import { describe, expect, it } from 'vitest';

import { defaultLanguage, supportedLanguages } from './languages';
import { resources } from './resources';

type TranslationNode = Record<string, unknown>;

function collectLeafKeys(node: TranslationNode, prefix = ''): string[] {
  const keys: string[] = [];

  for (const [key, value] of Object.entries(node)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...collectLeafKeys(value as TranslationNode, path));
      continue;
    }

    keys.push(path);
  }

  return keys;
}

describe('localization resource coverage', () => {
  it('includes every default-language key in all supported locales', () => {
    const baseline = resources[defaultLanguage].translation as TranslationNode;
    const baselineKeys = collectLeafKeys(baseline);

    for (const language of supportedLanguages) {
      const candidate = resources[language].translation as TranslationNode;
      const candidateKeys = new Set(collectLeafKeys(candidate));
      const missingKeys = baselineKeys.filter((key) => !candidateKeys.has(key));

      expect(
        missingKeys,
        `Missing translation keys in locale ${language}: ${missingKeys.join(', ')}`,
      ).toEqual([]);
    }
  });

  it('does not include unknown keys outside the default-language set', () => {
    const baseline = resources[defaultLanguage].translation as TranslationNode;
    const baselineKeys = new Set(collectLeafKeys(baseline));

    for (const language of supportedLanguages) {
      const candidate = resources[language].translation as TranslationNode;
      const candidateKeys = collectLeafKeys(candidate);
      const unknownKeys = candidateKeys.filter((key) => !baselineKeys.has(key));

      expect(
        unknownKeys,
        `Unknown translation keys in locale ${language}: ${unknownKeys.join(', ')}`,
      ).toEqual([]);
    }
  });
});
