## Context

The language selector (`apps/web/src/routes/index.tsx`) is built on the shadcn `Select` wrapper (`apps/web/src/components/ui/select.tsx`), which wraps `@base-ui/react/select`. Its `SelectValue` renders whatever is passed via a `children` render function (`(value) => node`) rather than automatically mirroring the matched `SelectItem`'s content — so trigger and list rendering are two separate call sites that both need the flag + native name, not one shared render path. The trigger's existing classes (`*:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5`) already anticipate an icon-plus-text layout.

See proposal.md for the "why" (Angličtina-when-Czech-is-active confusion) and specs/language-selection/spec.md for requirements.

## Goals / Non-Goals

**Goals:**
- Single source of truth for native name + ISO country code per `SupportedLanguage`, colocated with the existing `supportedLanguages` list.
- Flag rendering shared between trigger and list via one small presentational component, so the aria-hidden/decorative behavior is enforced in one place.

**Non-Goals:**
- Abstracting flag rendering behind a provider-agnostic interface — `react-circle-flags` is the only renderer needed.
- Changing `SupportedLanguage`, `resolveSupportedLanguage`, or language-detection/persistence logic.

## Decisions

**Static map lives in `languages.ts`, keyed by `SupportedLanguage`.**
Add `languageMetadata: Record<SupportedLanguage, { nativeName: string; countryCode: string }>` next to `supportedLanguages` in `apps/web/src/localization/languages.ts`. Alternative considered: keep native names in each locale file under a non-translated `languages.*` key — rejected because that reintroduces per-locale duplication of data that is by definition locale-invariant, which is the exact bug this change fixes.

**A small `LanguageOption` presentational component renders flag + name together.**
Add `apps/web/src/features/language-selection/LanguageOption.tsx` (or similar) rendering `<CircleFlag countryCode={...} aria-hidden="true" height="1em" /> {nativeName}`. Used both inside each `SelectItem` and inside `SelectValue`'s render function (looking up the currently selected language). Alternative considered: inline the JSX at both call sites — rejected, would duplicate the aria-hidden/layout logic and risk drifting between trigger and list.

**`react-circle-flags` is used directly, no wrapper abstraction.**
It's a single-purpose, actively maintained SVG flag component (`<CircleFlag countryCode="cz" />`) with no other project dependency competing for the same role. Alternative considered: bundle local SVG assets — rejected as more maintenance for no behavioral benefit (proposal already rejected building a custom composite flag).

**Locale key removal is mechanical.**
Delete the `languages` object from each of the six locale files (`en, cs, de, pl, nl, hu`) and the `t(\`languages.${language}\`)` call site in `index.tsx`, replaced by a direct lookup into `languageMetadata`.

## Risks / Trade-offs

- **New runtime dependency (`react-circle-flags`)** → small, focused package (SVG flags only); acceptable given no existing flag-rendering capability in the project.
- **Flag SVGs add visual weight to a previously text-only control** → mitigated by using the library's compact circular flag size (`height="1em"`) inline with text, no layout restructuring needed beyond the trigger's already-present flex/gap classes.
- **Missed accessible-name regression if `aria-hidden` is forgotten on either render site (trigger vs. list)** → mitigated by centralizing rendering in one `LanguageOption` component (Decisions, above) so the attribute is set once.
