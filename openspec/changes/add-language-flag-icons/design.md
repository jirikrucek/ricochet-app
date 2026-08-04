## Context

The language selector (`apps/web/src/routes/index.tsx`) is built on the shadcn `Select` wrapper (`apps/web/src/components/ui/select.tsx`), which wraps `@base-ui/react/select`. Its `SelectValue` renders whatever is passed via a `children` render function (`(value) => node`) rather than automatically mirroring the matched `SelectItem`'s content — so trigger and list rendering are two separate call sites that both need the flag + native name, not one shared render path. The trigger's existing classes (`*:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5`) already anticipate an icon-plus-text layout.

See proposal.md for the "why" (Angličtina-when-Czech-is-active confusion) and specs/language-selection/spec.md for requirements.

## Goals / Non-Goals

**Goals:**
- Single source of truth for native name + ISO country code per `SupportedLanguage`, colocated with the existing `supportedLanguages` list.
- Flag rendering shared between trigger and list via one small presentational component, so the aria-hidden/decorative behavior is enforced in one place.

**Non-Goals:**
- Abstracting flag rendering behind a provider-agnostic interface — a plain `<img>` over a local asset map is the only renderer needed.
- Changing `SupportedLanguage`, `resolveSupportedLanguage`, or language-detection/persistence logic.

## Decisions

**Static map lives in `languages.ts`, keyed by `SupportedLanguage`.**
Add `languageMetadata: Record<SupportedLanguage, { nativeName: string; countryCode: string }>` next to `supportedLanguages` in `apps/web/src/localization/languages.ts`. Alternative considered: keep native names in each locale file under a non-translated `languages.*` key — rejected because that reintroduces per-locale duplication of data that is by definition locale-invariant, which is the exact bug this change fixes.

**A small `LanguageOption` presentational component renders flag + name together.**
Add `apps/web/src/features/language-selection/LanguageOption.tsx` rendering `<img src={flagsByCountryCode[countryCode]} alt="" aria-hidden="true" className="size-4 shrink-0" /> {nativeName}`. Used both inside each `SelectItem` and inside `SelectValue`'s render function (looking up the currently selected language). Alternative considered: inline the JSX at both call sites — rejected, would duplicate the aria-hidden/layout logic and risk drifting between trigger and list.

**Flag SVGs are vendored locally under `apps/web/src/assets/flags/`, no CDN dependency.**
Only six flags are needed (`gb, cz, de, pl, nl, hu`), sourced from the MIT-licensed `circle-flags` project and committed to the repo, imported as Vite assets. Alternative considered: `react-circle-flags`, a wrapper component that fetches SVGs from `react-circle-flags.pages.dev` at runtime — rejected because a third-party CDN dependency for a fixed set of six flags is an unnecessary availability, privacy, and CSP risk with no behavioral benefit; vendoring is no more maintenance for a closed set of six codes that isn't expected to grow (see Non-Goals).

**Locale key removal is mechanical.**
Delete the `languages` object from each of the six locale files (`en, cs, de, pl, nl, hu`) and the `t(\`languages.${language}\`)` call site in `index.tsx`, replaced by a direct lookup into `languageMetadata`.

## Risks / Trade-offs

- **Vendored SVGs go stale if flag designs change upstream** → acceptable: only six fixed, rarely-changing national flags; no ongoing sync process needed.
- **Flag SVGs add visual weight to a previously text-only control** → mitigated by sizing the flag with the codebase's existing icon-size convention (Tailwind `size-4`, matching the chevron/check icons in `select.tsx`) inline with text, no layout restructuring needed beyond the trigger's already-present flex/gap classes.
- **Missed accessible-name regression if `aria-hidden` is forgotten on either render site (trigger vs. list)** → mitigated by centralizing rendering in one `LanguageOption` component (Decisions, above) so the attribute is set once.
