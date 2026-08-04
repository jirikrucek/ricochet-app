## 1. Dependency

- [ ] 1.1 Add `react-circle-flags` to `apps/web/package.json` and install it.

## 2. Language metadata

- [ ] 2.1 Add `languageMetadata: Record<SupportedLanguage, { nativeName: string; countryCode: string }>` to `apps/web/src/localization/languages.ts` with entries for `en` (English, GB), `cs` (Čeština, CZ), `de` (Deutsch, DE), `pl` (Polski, PL), `nl` (Nederlands, NL), `hu` (Magyar, HU).

## 3. Flag + name rendering

- [ ] 3.1 Create `apps/web/src/features/language-selection/LanguageOption.tsx`, a presentational component rendering `<CircleFlag countryCode={...} aria-hidden="true" height="1em" />` next to the language's native name.
- [ ] 3.2 Use `LanguageOption` inside each `SelectItem` in `apps/web/src/routes/index.tsx`, replacing the `t(\`languages.${language}\`)` call.
- [ ] 3.3 Use `LanguageOption` inside `SelectValue`'s render function in `apps/web/src/routes/index.tsx`, looking up the currently selected language's metadata.

## 4. Remove dead translation keys

- [ ] 4.1 Remove the `languages` object from each of the six locale files: `apps/web/src/localization/locales/{en,cs,de,pl,nl,hu}.ts`.

## 5. E2E tests (`apps/web/tests/e2e/language-selection.spec.ts`)

- [ ] 5.1 Update the existing "changes the app language from the selector" test to assert on native names (e.g. `Deutsch`, not `German`) instead of locale-translated option labels.
- [ ] 5.2 Add a test for "Native name shown regardless of active locale": with Czech active, assert the English option reads "English" and the German option reads "Deutsch" (not their Czech translations).
- [ ] 5.3 Add a test for "Selected language's native name shown when collapsed": select a language, collapse the selector, and assert the trigger displays that language's native name.
- [ ] 5.4 Add a test for "Flag shown for each supported language": open the selector list and assert each option contains a flag icon alongside its native name.
- [ ] 5.5 Add a test for "Flag shown when collapsed": select a language, collapse the selector, and assert the trigger contains that language's flag icon alongside its native name.
- [ ] 5.6 Add a test for "Screen reader announces only the language name": assert the flag element has `aria-hidden="true"` and the accessible name of the option/trigger (via `getByRole` name) is only the native language name.