# ADR 0005: Adopt Frontend Localization with i18next

- Status: Accepted
- Date: 2026-07-22

## Context

Ricochet App must support multiple UI languages with English as default, while keeping UI text out of components and bootstrap code. We need a predictable localization approach that scales with domain features and aligns with the existing TypeScript React architecture.

## Decision

Adopt `i18next` with `react-i18next` and browser language detection for frontend localization.

- Use one locale file per supported language under `apps/web/src/localization/locales`.
- Keep English (`en`) as the fallback language.
- Support these language codes:
  - `en` (English)
  - `cs` (Czech)
  - `de` (German)
  - `pl` (Polish)
  - `nl` (Dutch)
  - `hu` (Hungarian)
- Store translation resources in a dedicated localization module:
  - `apps/web/src/localization/i18n.ts`
  - `apps/web/src/localization/resources.ts`
  - `apps/web/src/localization/languages.ts`
- Require user-facing text to be referenced by translation key (`t(...)`) instead of hardcoded strings.

## Consequences

- Positive:
  - UI copy is decoupled from component logic.
  - Adding or updating languages is localized to translation files.
  - Language selection can persist via browser storage and detect user preference.
- Tradeoffs:
  - Missing translation keys can surface at runtime if not validated.
  - Localization adds another layer to frontend initialization and testing.

## Alternatives Considered

- Custom in-house dictionary utility: simpler initially, but weaker ecosystem support and no built-in detection/fallback features.
- FormatJS/react-intl: viable, but i18next provides a lighter adoption path for current project scale.

## Notes

This ADR extends ADR 0002 by defining how user-facing text is managed in the frontend architecture.
