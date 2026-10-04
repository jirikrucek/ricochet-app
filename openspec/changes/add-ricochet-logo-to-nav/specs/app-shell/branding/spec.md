## Purpose

Shows the official Ricochet brand identity in the app shell (the logo in the top nav bar and the favicon in the browser tab), so users recognise the product on every page.

## ADDED Requirements

### Requirement: Top nav bar displays the Ricochet logo as the app's identity
The system SHALL display the official Ricochet logo at the start of the top nav bar on every page. The logo replaces the former text title "Ricochet" and its placeholder icon: no separate text title or icon SHALL appear next to it.

#### Scenario: Logo shown on the home page
- **GIVEN** a visitor is on the home page
- **WHEN** the page has loaded
- **THEN** the top nav bar shows the Ricochet logo at its start
- **AND** no "Ricochet" text title or separate placeholder icon appears next to the logo

#### Scenario: Logo shown on a phone
- **GIVEN** a visitor is on the home page with a viewport 375px wide
- **WHEN** the page has loaded
- **THEN** the top nav bar shows the Ricochet logo at its start

#### Scenario: Logo shown on every section of the app
- **GIVEN** a visitor is on the Players page
- **WHEN** the visitor goes to the Tournaments page
- **THEN** the top nav bar still shows the same Ricochet logo

### Requirement: Logo takes the user to the home page
The system SHALL make the logo in the top nav bar a link to the home page.

#### Scenario: Returning home from another section
- **GIVEN** a visitor is on the Tournaments page
- **WHEN** the visitor activates the Ricochet logo
- **THEN** the home page is shown

### Requirement: Logo has a stable accessible name
The system SHALL expose the logo link to assistive technology with the accessible name "Ricochet". Because the name is a brand name, it SHALL stay the same in every supported UI language. The logo artwork itself SHALL NOT be announced separately from the link.

#### Scenario: Screen reader announces the brand name
- **GIVEN** the active UI language is English
- **WHEN** a screen reader reaches the logo in the top nav bar
- **THEN** it announces a link named "Ricochet"

#### Scenario: Brand name is not translated
- **GIVEN** the active UI language is Czech
- **WHEN** a screen reader reaches the logo in the top nav bar
- **THEN** it still announces a link named "Ricochet"

### Requirement: Logo faithfully reproduces the official artwork
The system SHALL render the logo with the shapes and brand colours of the official Ricochet artwork attached to issue #36: grey "RICHET" lettering and the red ring inside the grey "C" with its motion strokes. The registered-trademark mark (®) from the original artwork SHALL NOT be shown. The wordmark SHALL keep its original proportions, without stretching or cropping.

#### Scenario: Logo matches the official artwork
- **GIVEN** a visitor is on any page
- **WHEN** the visitor looks at the top nav bar
- **THEN** the logo shows grey lettering and the red ring inside the "C"
- **AND** no ® mark is shown
- **AND** the logo is neither stretched, squashed, nor cropped

### Requirement: Logo stays sharp at any display density or zoom level
The system SHALL deliver the logo as resolution-independent vector artwork, so it renders without pixelation or blur on high-density displays and when the page is zoomed.

#### Scenario: Logo on a high-density display
- **GIVEN** a visitor uses a display with a device pixel ratio of 2 or more
- **WHEN** the top nav bar is shown
- **THEN** the logo edges are crisp, with no visible pixelation or blur

#### Scenario: Logo when the page is zoomed in
- **GIVEN** a visitor has zoomed the page to 200%
- **WHEN** the top nav bar is shown
- **THEN** the logo scales up with crisp edges and no visible pixelation

### Requirement: Logo fits within the top nav bar at every viewport width
The system SHALL size the logo to fit fully inside the top nav bar at every viewport width from 320px upward. It SHALL never be clipped, overlap other nav items, or make the page scroll horizontally. At widths of 744px and above, the nav bar's height and the position of its other items (section links and language selector) SHALL stay as they are today.

#### Scenario: Logo sits inside the nav bar at desktop width
- **GIVEN** a visitor is on any page with a viewport 1280px wide
- **WHEN** the top nav bar is shown
- **THEN** the whole logo is visible inside the nav bar
- **AND** the section links and the language selector stay in their usual places

#### Scenario: Logo fits beside the menu button on a phone
- **GIVEN** a visitor is on any page with a viewport 375px wide
- **WHEN** the top nav bar is shown
- **THEN** the whole logo is visible inside the nav bar, without overlapping the menu button
- **AND** the page does not scroll horizontally

#### Scenario: Logo fits on the narrowest supported phone
- **GIVEN** a visitor is on any page with a viewport 320px wide
- **WHEN** the top nav bar is shown
- **THEN** the whole logo is visible with its proportions intact
- **AND** the page does not scroll horizontally

### Requirement: Browser tab shows the Ricochet favicon
The system SHALL provide a favicon derived from the Ricochet logo's red ring mark, so the app's browser tab and bookmarks are identifiable as Ricochet.

#### Scenario: Favicon shown in the browser tab
- **GIVEN** a visitor opens the app in a browser
- **WHEN** the page has loaded
- **THEN** the browser tab shows the Ricochet ring-mark favicon instead of the browser's default icon
