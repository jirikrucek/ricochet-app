// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import i18n from '@/localization/i18n';
import { useLanguageSelection } from './useLanguageSelection';

describe('useLanguageSelection', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('resolves the active language as the initial selection', async () => {
    await i18n.changeLanguage('de');

    const { result } = renderHook(() => useLanguageSelection());

    expect(result.current.selectedLanguage).toBe('de');
  });

  it('falls back to the default language when the active language is unsupported', async () => {
    await i18n.changeLanguage('fr');

    const { result } = renderHook(() => useLanguageSelection());

    expect(result.current.selectedLanguage).toBe('en');
  });

  it('lists every supported language with its display metadata', () => {
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

  it('updates the selection and changes the app language when a new option is chosen', async () => {
    const { result } = renderHook(() => useLanguageSelection());

    await act(async () => {
      result.current.onSelect('de');
    });

    expect(result.current.selectedLanguage).toBe('de');
    expect(i18n.resolvedLanguage).toBe('de');
  });

  it('keeps mounted selectors in sync after changing language on mobile', async () => {
    const { result } = renderHook(() => ({
      desktop: useLanguageSelection(),
      mobile: useLanguageSelection(),
    }));

    await act(async () => {
      result.current.mobile.onSelect('de');
    });

    expect(result.current.desktop.selectedLanguage).toBe('de');
    expect(result.current.mobile.selectedLanguage).toBe('de');

    await act(async () => {
      result.current.desktop.onSelect('en');
    });

    expect(result.current.desktop.selectedLanguage).toBe('en');
    expect(result.current.mobile.selectedLanguage).toBe('en');
  });

  it('does not call changeLanguage when selecting the already-active language', () => {
    const changeLanguage = vi.spyOn(i18n, 'changeLanguage');
    const { result } = renderHook(() => useLanguageSelection());

    act(() => {
      result.current.onSelect('en');
    });

    expect(changeLanguage).not.toHaveBeenCalled();
  });
});
