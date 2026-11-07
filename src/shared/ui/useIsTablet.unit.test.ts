// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { mockMatchMedia } from './matchMediaMocks';
import { tabletMediaQuery, useIsTablet } from './useIsTablet';

afterEach(() => {
  document.documentElement.style.removeProperty('--breakpoint-tablet');
});

describe('tabletMediaQuery', () => {
  it('asks for at least the width of the tablet breakpoint token', () => {
    document.documentElement.style.setProperty('--breakpoint-tablet', '744px');

    expect(tabletMediaQuery()).toBe('(min-width: 744px)');
  });
});

describe('useIsTablet', () => {
  it('is true when the viewport is at least as wide as the tablet breakpoint', () => {
    document.documentElement.style.setProperty('--breakpoint-tablet', '744px');
    const viewport = mockMatchMedia(true);

    const { result } = renderHook(() => useIsTablet());

    expect(result.current).toBe(true);
    expect(viewport.queries).toContain('(min-width: 744px)');
  });

  it('is false when the viewport is narrower', () => {
    mockMatchMedia(false);

    const { result } = renderHook(() => useIsTablet());

    expect(result.current).toBe(false);
  });

  it('follows the viewport when it crosses the breakpoint', () => {
    const viewport = mockMatchMedia(true);
    const { result } = renderHook(() => useIsTablet());

    act(() => viewport.setMatches(false));
    expect(result.current).toBe(false);

    act(() => viewport.setMatches(true));
    expect(result.current).toBe(true);
  });
});
