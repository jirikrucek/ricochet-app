# ADR 0005: Adopt Frontend Localization with i18next

- Status: Accepted
- Created: 2026-07-22
- Updated: 2026-11-02

## Context

Ricochet App must support multiple UI languages with English as default, while keeping UI text out of components and bootstrap code. We need a predictable localization approach that scales with domain features and aligns with the existing TypeScript React architecture.

## Decision

Adopt `i18next` with `react-i18next` and browser language detection for frontend localization.

- Use one locale file per supported language under `src/locales`.
- Keep English (`en`) as the fallback language.
- Support these language codes:
  - `en` (English)
  - `cs` (Czech)
  - `de` (German)
  - `pl` (Polish)
  - `nl` (Dutch)
  - `hu` (Hungarian)
- Keep translation resources and the language list in `src/locales`, and the i18next setup in `src/lib`:
  - `src/lib/i18n.ts`
  - `src/locales/resources.ts`
  - `src/locales/languages.ts`
- Require user-facing text to be referenced by translation key (`t(...)`) instead of hardcoded strings.

## Alternatives Considered

- Custom in-house dictionary utility. Rejected: simpler initially, but weaker ecosystem support and no built-in detection/fallback features.
- FormatJS/react-intl. Rejected: viable, but i18next provides a lighter adoption path for current project scale.

## Consequences

- Positive: UI copy is decoupled from component logic.
- Positive: adding or updating languages is localized to translation files.
- Positive: language selection can persist via browser storage and detect user preference.
- Negative: missing translation keys can surface at runtime if not validated.
- Negative: localization adds another layer to frontend initialization and testing.

## Notes

- This ADR extends ADR 0002 by defining how user-facing text is managed in the frontend architecture.
