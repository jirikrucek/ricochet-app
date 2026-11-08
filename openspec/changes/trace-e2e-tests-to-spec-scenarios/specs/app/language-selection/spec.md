## ADDED Requirements

### Requirement: Choosing a language translates the interface
The system SHALL show the app's interface text in the language the **visitor** chooses in the language selector, as soon as it is chosen.

#### Scenario: Switching to German on a wide screen
- **GIVEN** a visitor with English as the UI language is on the home page with a viewport 1280px wide
- **WHEN** the visitor chooses "Deutsch" in the nav bar's language selector
- **THEN** the app's interface text is shown in German
