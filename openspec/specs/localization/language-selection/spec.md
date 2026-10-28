# language-selection Specification

## Purpose

Lets users pick the app's UI language from a selector whose labels stay recognizable no matter which language is currently active.

## Requirements

### Requirement: Language options display native names
The system SHALL label each language option in the language selector with that language's native name (endonym), not a translation of the language name into the currently active UI language.

#### Scenario: Native name shown regardless of active locale
- **GIVEN** the active UI language is Czech
- **WHEN** the user opens the language selector
- **THEN** the option for English reads "English" and the option for German reads "Deutsch", not their Czech translations

#### Scenario: Selected language's native name shown when collapsed
- **GIVEN** a language is selected
- **WHEN** the selector is collapsed
- **THEN** the selector displays that language's native name

### Requirement: Language options display a country flag icon
The system SHALL display a country flag icon next to each language's native name, both in the collapsed selector and in each option of the selector list.

#### Scenario: Flag shown for each supported language
- **WHEN** the user opens the language selector list
- **THEN** each option shows a flag paired with the language's native name, using CZ for Czech, DE for German, PL for Polish, NL for Dutch, HU for Hungarian, and GB for English

#### Scenario: Flag shown when collapsed
- **GIVEN** a language is selected
- **WHEN** the selector is collapsed
- **THEN** the selector shows that language's flag alongside its native name

### Requirement: Flag icon is decorative to assistive technology
The system SHALL rely on the native language name, not the flag icon, as the accessible label for a language option.

#### Scenario: Screen reader announces only the language name
- **WHEN** a screen reader reads a language option or the collapsed selector
- **THEN** it announces the native language name and does not announce the flag icon

### Requirement: Page title and language follow the UI language
The system SHALL set the browser tab title to the app title in the active UI language, and SHALL set the page's language attribute to the active UI language, both when the app loads and whenever the language changes.

#### Scenario: Title and language on load
- **GIVEN** the active UI language is English
- **WHEN** the app loads
- **THEN** the tab title reads "Ricochet App"
- **AND** the page's language is `en`

#### Scenario: Title and language after a language change
- **GIVEN** the app is shown in English
- **WHEN** the user selects Čeština in the language selector
- **THEN** the tab title reads "Aplikace Ricochet"
- **AND** the page's language is `cs`
