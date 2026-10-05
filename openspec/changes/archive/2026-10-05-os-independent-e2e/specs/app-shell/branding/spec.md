## MODIFIED Requirements

### Requirement: Logo stays sharp at any display density or zoom level
The system SHALL deliver the logo as resolution-independent vector artwork, so it renders without pixelation or blur on high-density displays and when the page is zoomed.

#### Scenario: Logo on a high-density display
- **GIVEN** a visitor uses a display with a device pixel ratio of 2 or more
- **WHEN** the top nav bar is shown
- **THEN** the logo is delivered as vector artwork
- **AND** the logo keeps the same size and proportions as on a standard display

#### Scenario: Logo when the page is zoomed in
- **GIVEN** a visitor has zoomed the page to 200%
- **WHEN** the top nav bar is shown
- **THEN** the logo is delivered as vector artwork
- **AND** the logo is twice its normal size and keeps its proportions
