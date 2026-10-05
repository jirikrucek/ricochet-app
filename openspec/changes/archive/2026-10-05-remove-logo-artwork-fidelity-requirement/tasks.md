## 1. Remove the logo artwork fidelity requirement

This is a pure removal, so there is no new behaviour to cover with a new E2E test. The remaining branding scenarios keep their existing E2E coverage and must stay green.

- [x] 1.1 Delete the e2e test "Logo matches the official artwork" from `tests/e2e/app-shell/branding.spec.ts` and delete `branding.spec.ts-snapshots/logo-chromium-linux.png`; keep `expectRenderedRatioToMatchViewBox` (still used by the zoom test)
- [x] 1.2 Confirm no remaining reference to the removed requirement or the `logo.png` baseline (`grep -rIn "faithfully reproduces\|matches the official artwork\|'logo.png'"` outside `openspec/changes/archive/`)
- [x] 1.3 Run `npm run typecheck`, `npm run lint`, `npm run build` and `npm run test:all`; all must pass
- [x] 1.4 Run `openspec validate remove-logo-artwork-fidelity-requirement --strict`
