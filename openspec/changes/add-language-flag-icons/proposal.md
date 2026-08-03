## Why

Users get confused when switching languages because the selector currently shows each language's name translated *into whichever language is currently active* (e.g. "English" renders as "Angličtina" when Czech is active), rather than a name and visual the user can recognize at a glance regardless of the current locale.

## What Changes

- Replace the per-locale translated `languages.*` keys with a single static map of native-language names (endonyms) that don't change with the active UI language: `en: "English"`, `cs: "Čeština"`, `de: "Deutsch"`, `pl: "Polski"`, `nl: "Nederlands"`, `hu: "Magyar"`.
- Remove the now-dead `languages.*` translation keys from all six locale files.
- Add a country flag icon (via the new `react-circle-flags` dependency) next to each language's native name: `cs→CZ`, `de→DE`, `pl→PL`, `nl→NL`, `hu→HU`, `en→GB`.
- Show the flag + native name in both the collapsed `SelectTrigger` and each `SelectItem` in the language dropdown.
- Mark the flag SVG `aria-hidden="true"` (decorative); the visible native name remains the accessible label.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `language-selection`: the selector's display requirements change from "show language name translated into the active locale" to "show each language's native name paired with a country flag icon, in both the trigger and the list."

## Impact

- `apps/web/src/routes/index.tsx` — selector rendering (trigger + items).
- `apps/web/src/localization/languages.ts` — add static native-name and country-code maps.
- `apps/web/src/localization/locales/{en,cs,de,pl,nl,hu}.ts` — remove dead `languages.*` keys.
- `apps/web/package.json` — new runtime dependency: `react-circle-flags`.
- `docs/adr/0006-language-selector-uses-native-labels-and-flags.md` — new ADR recording the native-label + flag decision, extending ADR 0005.

## Out of Scope

- Adding new supported languages.
- RTL layout support.
- Changing language-detection logic or order (browser detection, `localStorage` caching remain unchanged).
- A custom composite GB/US flag asset for English — considered and rejected in favor of the standard GB flag (see ADR 0006).
