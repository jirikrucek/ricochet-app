## Why

The requirement "Logo faithfully reproduces the official artwork" (introduced by `2026-10-04-add-ricochet-logo-to-nav`) is a pixel-level visual check that is not necessary. The other branding requirements already cover what matters: the logo is shown, links home, has a stable accessible name, stays sharp, and fits the nav bar.

## What Changes

- Remove the requirement "Logo faithfully reproduces the official artwork" and its scenario "Logo matches the official artwork" from the `app-shell/branding` spec.
- Remove the e2e test "Logo matches the official artwork" from `tests/e2e/app-shell/branding.spec.ts`, along with its `logo.png` screenshot baseline (`logo-chromium-linux.png`).
- Keep the helpers and baselines still used by other scenarios (`expectRenderedRatioToMatchViewBox`, `logo-2x`, `logo-zoom-200`).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `app-shell/branding`: the requirement "Logo faithfully reproduces the official artwork" is removed.

## Impact

- `openspec/specs/app-shell/branding/spec.md` (via the delta spec, applied on archive)
- `tests/e2e/app-shell/branding.spec.ts` and its snapshot directory
- No production code, dependencies, or APIs change.

## Out of Scope

- Changing the logo asset (`src/assets/brand/ricochet-logo.svg`) or the favicon.
- Editing the archived change `2026-10-04-add-ricochet-logo-to-nav`, which stays as a historical record.
- ADR 0008 and `docs/standards/design-system.md`: they describe why vendored artwork keeps its own colours, which is unaffected.
- The other branding requirements (home link, accessible name, sharpness, fit, favicon).

## Traceability

- Issue: #36
