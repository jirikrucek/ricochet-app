## Why

ADR 0005 requires user-facing text to come from translation keys, but the browser tab title (`<title>` in `index.html`) and the page's `lang` attribute are hardcoded English and never change with the UI language. A Czech user sees an English tab title, and screen readers pronounce Czech text with English rules.

## What Changes

- On every language change, set `document.title` from the `app.title` key and `document.documentElement.lang` to the resolved language (`src/localization/i18n.ts`).
- `index.html` keeps `Ricochet App` and `lang="en"` as the defaults shown before the app loads.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `localization/language-selection`: adds a requirement that the page title and language follow the UI language.

## Impact

- `src/localization/i18n.ts`
- `tests/e2e/localization/language-selection.spec.ts`
- No dependencies, APIs or data change.

## Out of Scope

- Per-route page titles.
- Translating the brand name.
