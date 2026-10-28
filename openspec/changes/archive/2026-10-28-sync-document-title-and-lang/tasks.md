## 1. Title and lang follow the UI language

- [x] 1.1 Add an E2E test: switching to Czech sets the page title to "Aplikace Ricochet" and `lang` to `cs`
- [x] 1.2 In `src/localization/i18n.ts`, update `document.title` and `document.documentElement.lang` on `languageChanged`, registered before `init`
