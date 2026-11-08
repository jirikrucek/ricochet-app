// An internals test (docs/standards/testing-standard.md): it checks the width
// of the shared Sheet component (src/ui/sheet.tsx), a design-system detail no
// spec scenario states. It guards the bug in
// https://github.com/jirikrucek/ricochet-app/issues/92, where a sheet without
// a width override collapsed to 8px at the sm breakpoint and wider. The tests
// open the mobile menu, a side sheet, to get one on screen.

import { expect, test } from '../fixtures';
import { boxOf, menu, openAt, openMenu } from '../app/shell';

test.describe('Sheet width at the sm breakpoint and wider', () => {
  // Wide enough for the sm breakpoint (640px), narrow enough that the menu
  // button is still shown (the tablet breakpoint is 744px).
  const SM_VIEWPORT = { width: 700, height: 800 };

  test('Menu keeps its own width', async ({ page }) => {
    await openAt(page, SM_VIEWPORT);

    await openMenu(page);

    await expect.poll(async () => (await boxOf(menu(page))).width).toBe(320);
  });

  // The menu overrides the sheet's max-width, which hides a broken default.
  // Drop its override classes so the width comes from the base SheetContent
  // rules in the built stylesheet, on each side it supports. For the right
  // side the base class is added back: tailwind-merge dropped it from the DOM
  // in favour of the override, but its rule is still in the stylesheet.
  for (const side of ['right', 'left'] as const) {
    test(`Sheet without a width override is 384px wide on the ${side}`, async ({
      page,
    }) => {
      await openAt(page, SM_VIEWPORT);
      await openMenu(page);
      await menu(page).evaluate((element, sheetSide) => {
        element.classList.remove('max-w-80', 'data-[side=right]:sm:max-w-80');
        element.classList.add(
          `data-[side=${sheetSide}]:sm:max-w-(--container-sm)`,
        );
        element.setAttribute('data-side', sheetSide);
      }, side);

      // The sheet is 75% of the viewport (525px) capped at 24rem. A cap
      // resolved against the 8px spacing token would leave it 8px wide.
      await expect.poll(async () => (await boxOf(menu(page))).width).toBe(384);
    });
  }
});
