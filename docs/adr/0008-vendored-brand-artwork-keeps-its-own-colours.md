# ADR 0008: Vendored Brand Artwork Keeps Its Own Colours

- Status: Accepted
- Created: 2026-10-04

## Context

The design-system standard requires UI styling to use the DESIGN.md colour tokens, with no custom hex values. The official Ricochet logo (issue #36) is vendored as `src/assets/brand/ricochet-logo.svg`, and the favicon (`public/favicon.svg`) is derived from its red ring. Both use the brand's own grey (`#818286`) and red (`#c3121a`), sampled from the official artwork. Neither colour exists in the token set, and the closest tokens (`muted`, `primary`) are visibly different hues.

## Decision

Vendored artwork keeps its intrinsic colours as literal fills inside the asset file. This covers brand marks like the logo and favicon, as well as third-party artwork like the flag SVGs from ADR 0006. Such assets are rendered as images (`<img>` or `<link rel="icon">`), so their fills never enter the page's CSS cascade. The token rule continues to govern all UI styling: components, layouts and any SVG drawn inline by our own code.

ADR 0006's flags set the precedent. They have always carried their own colours, and nobody would map a national flag to UI tokens.

## Alternatives Considered

- Map the logo's fills to the nearest existing tokens (`muted` grey, `primary` red). Rejected: it alters the official brand colours.
- Add brand colour tokens to DESIGN.md and `globals.css`. Rejected: the colours are used only by the artwork itself, so tokens would invite their use in UI styling, which DESIGN.md does not intend.
