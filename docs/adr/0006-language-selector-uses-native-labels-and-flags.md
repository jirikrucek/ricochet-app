# ADR 0006: Language Selector Uses Native-Language Labels and Country Flags

- Status: Accepted
- Date: 2026-08-03

## Context

The language selector (`apps/web/src/routes/index.tsx`) showed each language's name translated into the *currently active* UI language (e.g. "English" rendered as "Angličtina" when Czech was active). Users found this confusing when trying to locate their own language.

## Decision

Show each language as its native-language name (endonym) plus a country flag icon, regardless of the currently active UI language:

- `en` → "English" + GB flag
- `cs` → "Čeština" + CZ flag
- `de` → "Deutsch" + DE flag
- `pl` → "Polski" + PL flag
- `nl` → "Nederlands" + NL flag
- `hu` → "Magyar" + HU flag

Native names are a static, locale-invariant map — not translation resources — since they don't change based on the active UI language.

Flag SVGs are vendored into `apps/web/src/assets/flags/` (MIT-licensed, sourced from the `circle-flags` project) and imported as local assets rather than loaded from a third-party CDN at runtime. Only six flags are needed, so bundling them keeps the selector working offline, avoids taking an availability/privacy dependency on an external host, and sidesteps future CSP tightening. Each SVG is small enough that Vite inlines it as a `data:` URI in the built bundle — no separate network request at all.

English is mapped to the GB flag rather than a generic/placeholder flag (`xx`) or a custom composite GB/US graphic: a real ISO country flag keeps every entry visually consistent with the same component and rendering path, and no combined-flag asset exists in any standard flag-icon set.

## Alternatives Considered

- Generic `xx` placeholder flag for English — avoids implying a specific country, but was rejected in favor of GB for visual consistency with the other rows.
- Custom composite GB/US flag asset — not an ISO 3166 code, would require a bespoke asset and rendering path outside the flag library; rejected as disproportionate scope for this problem.
- `react-circle-flags` (loading SVGs from `react-circle-flags.pages.dev` at runtime) — initially used, then rejected: a third-party CDN dependency for a fixed set of six flags is an unnecessary availability, privacy, and CSP risk with no benefit over vendoring the assets directly.

## Notes

This extends ADR 0005 (frontend localization with i18next), which defines the supported language codes but not how they are labeled or iconified in the selector UI.
