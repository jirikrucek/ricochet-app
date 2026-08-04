// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: mockI18n,
  }),
}));

const mockI18n = {
  language: 'en',
  resolvedLanguage: 'en' as string | undefined,
  changeLanguage: vi.fn(),
};

import { useLanguageSelection } from './useLanguageSelection';

describe('useLanguageSelection', () => {
  it('resolves the active language as the initial selection', () => {
    mockI18n.resolvedLanguage = 'de';

    const { result } = renderHook(() => useLanguageSelection());

    expect(result.current.selectedLanguage).toBe('de');
  });

  it('falls back to the default language when the active language is unsupported', () => {
    mockI18n.resolvedLanguage = 'fr';

    const { result } = renderHook(() => useLanguageSelection());

    expect(result.current.selectedLanguage).toBe('en');
  });

  it('lists every supported language with its display metadata', () => {
    mockI18n.resolvedLanguage = 'en';

    const { result } = renderHook(() => useLanguageSelection());

    expect(result.current.options).toEqual([
      { value: 'en', nativeName: 'English', countryCode: 'gb' },
      { value: 'cs', nativeName: 'Čeština', countryCode: 'cz' },
      { value: 'de', nativeName: 'Deutsch', countryCode: 'de' },
      { value: 'pl', nativeName: 'Polski', countryCode: 'pl' },
      { value: 'nl', nativeName: 'Nederlands', countryCode: 'nl' },
      { value: 'hu', nativeName: 'Magyar', countryCode: 'hu' },
    ]);
  });

  it('updates the selection and changes the app language when a new option is chosen', () => {
    mockI18n.resolvedLanguage = 'en';
    mockI18n.changeLanguage.mockClear();

    const { result } = renderHook(() => useLanguageSelection());

    act(() => {
      result.current.onSelect('de');
    });

    expect(result.current.selectedLanguage).toBe('de');
    expect(mockI18n.changeLanguage).toHaveBeenCalledWith('de');
  });

  it('does not call changeLanguage when selecting the already-active language', () => {
    mockI18n.resolvedLanguage = 'en';
    mockI18n.changeLanguage.mockClear();

    const { result } = renderHook(() => useLanguageSelection());

    act(() => {
      result.current.onSelect('en');
    });

    expect(mockI18n.changeLanguage).not.toHaveBeenCalled();
  });
});
