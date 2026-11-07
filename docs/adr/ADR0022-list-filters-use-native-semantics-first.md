# ADR 0022: List Filters Use Native Semantics First

- Status: Accepted
- Created: 2026-11-07
- Updated: 2026-11-07

## Context

The request that led to ADR 0021 asked for **filters** that are progressively enhanced. The app is a client-rendered SPA (ADR 0001), so a **visitor** without JavaScript sees nothing at all, and a baseline that works without JavaScript would need server rendering or prerendering, which is a platform change.

The prototype simulated a baseline with a switch that rendered a plain GET form with native selects and an Apply button. That state cannot occur in production. Keeping it would mean two render paths for every list, and tests for a state no **visitor** can reach.

What remains valuable from the idea is the semantics: a real form, real links and real buttons that React builds on, instead of generic elements with click handlers.

## Decision

Build list **filters** on native elements and let React add behaviour on top. There is no separate baseline mode and no switch for one.

- The **filters panel** contains a real `<form method="get">` with an `action`, and each control's `name` equals its URL search param. Apply is the form's submit button, so Enter submits.
- The **filters button** is a real button. Each **applied filter** chip and Clear all filters is a real link with an `href` to the same view, so it also works in a new tab and when copied.
- React handles the form submit and the link clicks without a page load, and adds the **popover**, the **sheet**, the **filter draft** and the announcements.
- This is not a guarantee for **visitors** without JavaScript. The standard and the specs say so, and tests do not try to run the app without it.
- This decision covers list **filters**. It does not decide how other controls in the app are built.

## Alternatives Considered

- Two render paths, a native baseline and an enhanced version, switched by a flag, as in the prototype. Rejected: twice the code and tests for a state that never occurs in production.
- Server rendering or prerendering, so a no-JavaScript baseline is real. Rejected: it contradicts ADR 0001 and is a platform change far larger than this feature.
- Generic elements with click handlers only. Rejected: chips and Clear all filters would lose open-in-new-tab and copy-link, and tests would have no structure to assert.

## Consequences

- Positive: chips and Clear all filters behave like links, and the form is operable with the keyboard without extra code.
- Positive: the specs and tests can assert roles and attributes, such as a chip's `href` or the form's `action`, in line with ADR 0009.
- Negative: "progressive enhancement" would mislead, because it suggests the filters work without JavaScript. Call this approach native semantics first and don't describe it as progressive enhancement, so nobody expects a baseline that does not exist.
- Negative: a control's `name` is tied to its search param, so a new **filter** also names a param.
- Follow-up: if the app ever gains server rendering, a real baseline becomes possible without changing this markup.
