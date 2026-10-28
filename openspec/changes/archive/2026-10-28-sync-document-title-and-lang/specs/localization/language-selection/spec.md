## ADDED Requirements

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
