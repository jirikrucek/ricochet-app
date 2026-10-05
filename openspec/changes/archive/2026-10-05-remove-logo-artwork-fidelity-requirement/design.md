## Context

The requirement is verified by a single e2e test, "Logo matches the official artwork", in `tests/e2e/app-shell/branding.spec.ts`. It calls `expectRenderedRatioToMatchViewBox`, which the zoom test also uses, and takes the `logo.png` screenshot. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- Leave no spec, test or baseline referring to the removed requirement.

**Non-Goals:**
- No change to the logo asset, `TopNav`, or the other branding tests.

## Decisions

- **Delete the test and its baseline together.** `logo-chromium-linux.png` is only referenced by that test, so leaving it would orphan a snapshot. Other baselines (`logo-2x`, `logo-zoom-200`) belong to other scenarios and stay.
- **Keep the shared helper.** `expectRenderedRatioToMatchViewBox` is still used by the zoom test.
- **Leave the archived change untouched.** It is a historical record; the live spec is updated via the REMOVED delta on archive.
- **Leave ADR 0008 and the design-system standard as is.** They justify keeping brand colours inside the asset and do not depend on the removed requirement.

## Risks / Trade-offs

- [Unintended logo artwork regressions are no longer caught by a visual baseline] → Accepted; the 2x and zoom screenshots still guard rendering.
