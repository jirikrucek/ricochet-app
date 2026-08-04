## 1. Flag assets

- [x] 1.1 Vendor the six flag SVGs (`gb, cz, de, pl, nl, hu`, MIT-licensed, sourced from the `circle-flags` project) into `apps/web/src/assets/flags/`. No runtime CDN dependency — no `react-circle-flags` package.

## 2. Language metadata

- [x] 2.1 Add `languageMetadata: Record<SupportedLanguage, { nativeName: string; countryCode: string }>` to `apps/web/src/localization/languages.ts` with entries for `en` (English, GB), `cs` (Čeština, CZ), `de` (Deutsch, DE), `pl` (Polski, PL), `nl` (Nederlands, NL), `hu` (Magyar, HU).

## 3. Flag + name rendering

- [x] 3.1 Create `apps/web/src/features/language-selection/LanguageOption.tsx`, a presentational component rendering `<img src={flagsByCountryCode[countryCode]} alt="" aria-hidden="true" className="size-4 shrink-0" />` next to the language's native name.
- [x] 3.2 Use `LanguageOption` inside each `SelectItem` in `apps/web/src/routes/index.tsx`, replacing the `t(\`languages.${language}\`)` call.
- [x] 3.3 Use `LanguageOption` inside `SelectValue`'s render function in `apps/web/src/routes/index.tsx`, looking up the currently selected language's metadata.

## 4. Remove dead translation keys

- [x] 4.1 Remove the `languages` object from each of the six locale files: `apps/web/src/localization/locales/{en,cs,de,pl,nl,hu}.ts`.

## 5. E2E tests (`apps/web/tests/e2e/language-selection.spec.ts`)

- [x] 5.1 Update the existing "changes the app language from the selector" test to assert on native names (e.g. `Deutsch`, not `German`) instead of locale-translated option labels.
- [x] 5.2 Add a test for "Native name shown regardless of active locale": with Czech active, assert the English option reads "English" and the German option reads "Deutsch" (not their Czech translations).
- [x] 5.3 Add a test for "Selected language's native name shown when collapsed": select a language, collapse the selector, and assert the trigger displays that language's native name.
- [x] 5.4 Add a test for "Flag shown for each supported language": open the selector list and assert each option contains a flag icon alongside its native name, and that the image loaded successfully (`complete && naturalWidth > 0`) — hermetic since flags are bundled locally, no network request involved.
- [x] 5.5 Add a test for "Flag shown when collapsed": select a language, collapse the selector, and assert the trigger contains that language's flag icon alongside its native name, loaded successfully.
- [x] 5.6 Add a test for "Screen reader announces only the language name": assert the flag element has `aria-hidden="true"` and the accessible name of the option/trigger (via `getByRole` name) is only the native language name.