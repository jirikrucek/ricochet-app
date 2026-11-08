## MODIFIED Requirements

### Requirement: Top nav bar shows the full single-row layout from 744px upward
The system SHALL show the logo, the Players and Tournaments section links, and the language selector together in one row of the top nav bar when the viewport is 744px wide or wider. No menu button SHALL be shown at these widths. If the menu is open when the viewport widens to 744px or more, the system SHALL close it.

#### Scenario: Tablet width shows the full nav
- **GIVEN** a visitor is on the home page with a viewport 744px wide
- **WHEN** the top nav bar is shown
- **THEN** the logo, the Players and Tournaments links, and the language selector are all visible in the nav bar
- **AND** no menu button is shown

#### Scenario: Menu closes when the viewport widens to tablet width
- **GIVEN** a visitor on a phone has opened the menu
- **WHEN** the viewport widens to 744px
- **THEN** the menu is closed
- **AND** the nav bar shows the Players and Tournaments links
- **AND** the page can scroll again

### Requirement: Language can be changed from the menu
The system SHALL let the visitor change the UI language using the language selector inside the menu, with the same languages and behaviour as the selector in the desktop nav. Both selectors SHALL always show the active UI language.

#### Scenario: Switching to German on a phone
- **GIVEN** a visitor on a phone with English as the UI language has opened the menu
- **WHEN** the visitor chooses "Deutsch" in the menu's language selector
- **THEN** the app's interface text is shown in German

#### Scenario: Language chosen in the menu stays chosen on a wider screen
- **GIVEN** a visitor on a phone has chosen "Deutsch" in the menu's language selector
- **WHEN** the viewport widens to 1280px
- **THEN** the nav bar's language selector shows "Deutsch"
