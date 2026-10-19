export type PageRangeItem = number | 'ellipsis';

// Page links for a paginated list: the first page, the last page, and the
// current page with one neighbour on each side. A gap of one page shows that
// page; a longer gap becomes an ellipsis.
export function pageRange(current: number, count: number): PageRangeItem[] {
  const shown = new Set(
    [1, current - 1, current, current + 1, count].filter(
      (page) => page >= 1 && page <= count,
    ),
  );
  const pages = [...shown].sort((a, b) => a - b);

  const items: PageRangeItem[] = [];
  pages.forEach((page, index) => {
    const previous = pages[index - 1];
    if (previous !== undefined && page - previous === 2) {
      items.push(previous + 1);
    } else if (previous !== undefined && page - previous > 2) {
      items.push('ellipsis');
    }
    items.push(page);
  });
  return items;
}
