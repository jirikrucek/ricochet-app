// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useFilterAnnouncement } from './useFilterAnnouncement';

type Props = {
  resultText: string;
  isShowingPreviousPage: boolean;
  viewKey: string;
};

const before: Props = {
  resultText: 'Showing 1–25 of 100',
  isShowingPreviousPage: false,
  viewKey: 'all',
};

function renderAnnouncement(initial: Props = before) {
  return renderHook((props: Props) => useFilterAnnouncement(props), {
    initialProps: initial,
  });
}

// The announcement is set a moment after it is cleared, so that the same text
// said twice is heard twice.
const settle = () => act(() => vi.advanceTimersByTime(100));

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useFilterAnnouncement', () => {
  it('says nothing until the visitor changes a filter', () => {
    const { result, rerender } = renderAnnouncement();

    rerender({
      ...before,
      resultText: 'Showing 1–25 of 40',
      viewKey: 'female',
    });
    settle();

    expect(result.current.announcement).toBe('');
  });

  it('waits until the rows of the new view are shown, then says the new result', () => {
    const { result, rerender } = renderAnnouncement();

    act(() => result.current.announceResult(true));
    // The search changed, and the previous rows are still on screen.
    rerender({ ...before, isShowingPreviousPage: true, viewKey: 'female' });
    settle();
    expect(result.current.announcement).toBe('');

    rerender({
      resultText: 'Showing 1–25 of 40',
      isShowingPreviousPage: false,
      viewKey: 'female',
    });
    settle();
    expect(result.current.announcement).toBe('Showing 1–25 of 40');
  });

  it('says the result even when the new view reads exactly like the old one', () => {
    const { result, rerender } = renderAnnouncement();

    act(() => result.current.announceResult(true));
    // Rows already cached: there is no wait, and the text does not change.
    rerender({ ...before, viewKey: 'cached-view' });
    settle();

    expect(result.current.announcement).toBe(before.resultText);
  });

  it('says the current result at once when nothing changed', () => {
    const { result } = renderAnnouncement();

    act(() => result.current.announceResult(false));
    settle();

    expect(result.current.announcement).toBe(before.resultText);
  });

  it('says the same result again when it is asked for again', () => {
    const { result } = renderAnnouncement();
    act(() => result.current.announceResult(false));
    settle();
    expect(result.current.announcement).toBe(before.resultText);

    act(() => result.current.announceResult(false));

    expect(result.current.announcement).toBe('');
    settle();
    expect(result.current.announcement).toBe(before.resultText);
  });

  it('says nothing for a view the visitor did not ask for, such as going back', () => {
    const { result, rerender } = renderAnnouncement();
    act(() => result.current.announceResult(false));
    settle();
    act(() => result.current.announceResult(true));
    rerender({ ...before, viewKey: 'applied' });
    settle();
    expect(result.current.announcement).toBe(before.resultText);

    // Back: a new view and a new result, but no announceResult before it.
    rerender({
      resultText: 'Showing 1–25 of 40',
      isShowingPreviousPage: false,
      viewKey: 'back',
    });
    settle();

    expect(result.current.announcement).toBe(before.resultText);
  });

  it('is not used up by a change that has nothing to do with the request, such as a refetch of the old view', () => {
    const { result, rerender } = renderAnnouncement();
    act(() => result.current.announceResult(true));

    // The old view's result changes under the visitor, before the navigation.
    rerender({ ...before, resultText: 'Showing 1–25 of 101' });
    settle();
    expect(result.current.announcement).toBe('');

    // Now the requested view arrives.
    rerender({
      resultText: 'Showing 1–25 of 40',
      isShowingPreviousPage: false,
      viewKey: 'female',
    });
    settle();
    expect(result.current.announcement).toBe('Showing 1–25 of 40');
  });

  it('forgets a request whose navigation never happened, so a later Back is not announced', () => {
    const { result, rerender } = renderAnnouncement();
    act(() => result.current.announceResult(true));
    act(() => vi.advanceTimersByTime(5000));

    rerender({
      resultText: 'Showing 1–25 of 40',
      isShowingPreviousPage: false,
      viewKey: 'back',
    });
    settle();

    expect(result.current.announcement).toBe('');
  });

  it('drops an earlier request when the result is asked for at once', () => {
    const { result, rerender } = renderAnnouncement();
    act(() => result.current.announceResult(true));
    act(() => result.current.announceResult(false));
    settle();
    expect(result.current.announcement).toBe(before.resultText);

    rerender({
      resultText: 'Showing 1–25 of 40',
      isShowingPreviousPage: false,
      viewKey: 'elsewhere',
    });
    settle();

    expect(result.current.announcement).toBe(before.resultText);
  });

  it('clears the announcement after a while, so it is not left stale', () => {
    const { result } = renderAnnouncement();
    act(() => result.current.announceResult(false));
    settle();
    expect(result.current.announcement).toBe(before.resultText);

    act(() => vi.advanceTimersByTime(10_000));

    expect(result.current.announcement).toBe('');
  });
});
