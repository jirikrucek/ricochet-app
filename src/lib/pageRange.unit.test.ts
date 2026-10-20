import { describe, expect, it } from 'vitest';

import { pageBounds, pageRange } from './pageRange';

describe('pageRange', () => {
  it.each([
    [1, 10, [1, 2, 'ellipsis', 10]],
    [10, 10, [1, 'ellipsis', 9, 10]],
    [5, 10, [1, 'ellipsis', 4, 5, 6, 'ellipsis', 10]],
    [1, 4, [1, 2, 3, 4]],
  ] as const)(
    'page %i of %i gives the spec example',
    (current, count, expected) => {
      expect(pageRange(current, count)).toEqual(expected);
    },
  );

  it('gives a single page for a count of 1', () => {
    expect(pageRange(1, 1)).toEqual([1]);
  });

  it('gives both pages for a count of 2', () => {
    expect(pageRange(2, 2)).toEqual([1, 2]);
  });

  it('shows the page number for a one-page gap at the start', () => {
    expect(pageRange(4, 10)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 10]);
  });

  it('shows the page number for a one-page gap at the end', () => {
    expect(pageRange(7, 10)).toEqual([1, 'ellipsis', 6, 7, 8, 9, 10]);
  });
});

describe('pageBounds', () => {
  it.each([
    [1, 25, 100, { from: 1, to: 25 }],
    [2, 25, 100, { from: 26, to: 50 }],
    [4, 25, 90, { from: 76, to: 90 }],
    [1, 10, 4, { from: 1, to: 4 }],
  ] as const)(
    'page %i of size %i over %i gives %j',
    (page, pageSize, total, expected) => {
      expect(pageBounds(page, pageSize, total)).toEqual(expected);
    },
  );
});
