## Purpose

Keeps the top nav bar usable at every viewport width. It shows the full single-row nav on tablets and desktops, and collapses to the logo plus a menu button on phones, so the section links and language selector stay reachable without the page overflowing.

## ADDED Requirements

### Requirement: Top nav bar shows the full single-row layout from 744px upward
The system SHALL show the logo, the Players and Tournaments section links, and the language selector together in one row of the top nav bar when the viewport is 744px wide or wider. No menu button SHALL be shown at these widths.

#### Scenario: Tablet width shows the full nav
- **GIVEN** a visitor is on the home page with a viewport 744px wide
- **WHEN** the top nav bar is shown
- **THEN** the logo, the Players and Tournaments links, and the language selector are all visible in the nav bar
- **AND** no menu button is shown

### Requirement: Top nav bar collapses to the logo and a menu button below 744px
The system SHALL show only the logo and a menu button in the top nav bar when the viewport is narrower than 744px. The section links and the language selector SHALL NOT be shown in the nav bar itself. The top nav bar SHALL NOT make the page scroll horizontally at any width from 320px upward.

#### Scenario: Phone width shows the collapsed nav
- **GIVEN** a visitor is on the home page with a viewport 375px wide
- **WHEN** the top nav bar is shown
- **THEN** the nav bar shows the logo and a menu button
- **AND** the Players and Tournaments links and the language selector are not shown in the nav bar
- **AND** the page does not scroll horizontally

#### Scenario: Nav collapses just below the breakpoint
- **GIVEN** a visitor is on the home page with a viewport 743px wide
- **WHEN** the top nav bar is shown
- **THEN** the nav bar shows the logo and a menu button

#### Scenario: Nav adapts when the viewport is resized
- **GIVEN** a visitor is on the home page with a viewport 1280px wide
- **WHEN** the viewport is narrowed to 375px
- **THEN** the nav bar switches to the logo and a menu button

### Requirement: Menu button opens a menu with the section links and language selector
The system SHALL open a menu when the visitor activates the menu button. The menu SHALL contain the Players and Tournaments section links and the language selector, and SHALL show which section is currently active.

#### Scenario: Opening the menu
- **GIVEN** a visitor is on the home page on a phone
- **WHEN** the visitor activates the menu button
- **THEN** a menu opens showing the Players and Tournaments links and the language selector

#### Scenario: Active section is indicated in the menu
- **GIVEN** a visitor is on the Players page on a phone
- **WHEN** the visitor opens the menu
- **THEN** the Players link is marked as the current page

### Requirement: Navigating from the menu closes it
The system SHALL navigate to the chosen section and close the menu when the visitor activates a section link in it.

#### Scenario: Going to Tournaments from the menu
- **GIVEN** a visitor on a phone has opened the menu on the home page
- **WHEN** the visitor activates the Tournaments link
- **THEN** the Tournaments page is shown
- **AND** the menu is closed

### Requirement: Language can be changed from the menu
The system SHALL let the visitor change the UI language using the language selector inside the menu, with the same languages and behaviour as the selector in the desktop nav.

#### Scenario: Switching to German on a phone
- **GIVEN** a visitor on a phone with English as the UI language has opened the menu
- **WHEN** the visitor chooses "Deutsch" in the menu's language selector
- **THEN** the app's interface text is shown in German

### Requirement: Menu can be dismissed without navigating
The system SHALL close the menu, leaving the current page unchanged, when the visitor presses Escape, activates the menu's close control, or taps outside the menu. Focus SHALL then return to the menu button.

#### Scenario: Closing the menu with Escape
- **GIVEN** a visitor on a phone has opened the menu on the Players page
- **WHEN** the visitor presses Escape
- **THEN** the menu is closed
- **AND** the Players page is still shown
- **AND** keyboard focus is on the menu button

#### Scenario: Closing the menu by tapping outside it
- **GIVEN** a visitor on a phone has opened the menu
- **WHEN** the visitor taps the page area outside the menu
- **THEN** the menu is closed

### Requirement: Menu button is accessible and localized
The system SHALL give the menu button an accessible name in the active UI language and expose whether the menu is open or closed. While the menu is open, keyboard focus SHALL stay within it. The menu button SHALL have a touch target of at least 48×48px.

#### Scenario: Screen reader announces the menu button in English
- **GIVEN** the active UI language is English and the viewport is 375px wide
- **WHEN** a screen reader reaches the menu button
- **THEN** it announces a button with a name describing the menu (e.g. "Open menu") and that it is collapsed

#### Scenario: Menu button name follows the active language
- **GIVEN** the active UI language is Czech and the viewport is 375px wide
- **WHEN** a screen reader reaches the menu button
- **THEN** it announces the button's name in Czech

#### Scenario: Keyboard focus stays in the open menu
- **GIVEN** a keyboard user on a phone-width viewport has opened the menu
- **WHEN** the user tabs past the last item in the menu
- **THEN** focus moves back to the first focusable item in the menu, not to the page behind it
