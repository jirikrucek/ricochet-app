## MODIFIED Requirements

### Requirement: Player overview lists every player in a table
The system SHALL show the **player overview** at `/players` as a table with three columns: Surname, First name, and **Nationality**. The Surname column SHALL show the full surname as `[surname prefix] surname [surname suffix]`, leaving out any part a **player** does not have. The table SHALL be used at every viewport width from 320px upward, and the page SHALL NOT scroll horizontally.

#### Scenario: Players shown with surname, first name, and nationality
- **GIVEN** a player "Jana Nováková" with nationality CZ exists
- **WHEN** a visitor opens the player overview
- **THEN** the table has the columns Surname, First name, and Nationality
- **AND** a row shows "Nováková", "Jana", and the Czech flag

#### Scenario: Surname shown with its prefix and suffix
- **GIVEN** a player "Pieter de Vries" with surname prefix "de" exists
- **AND** a player "Tomáš Kovář" with surname suffix "jr." exists
- **WHEN** a visitor opens the player overview
- **THEN** the Surname column shows "de Vries" for Pieter
- **AND** the Surname column shows "Kovář jr." for Tomáš

#### Scenario: Table kept on a phone
- **GIVEN** players exist
- **WHEN** a visitor opens the player overview with a viewport 320px wide
- **THEN** the players are shown in a table with the Surname, First name, and Nationality columns
- **AND** the page does not scroll horizontally

#### Scenario: Table kept on a phone with a long unbroken name
- **GIVEN** a player whose first name and surname are each over 40 letters long, with no space or hyphen
- **WHEN** a visitor opens the player overview with a viewport 320px wide
- **THEN** the player is shown in the table
- **AND** the page does not scroll horizontally

### Requirement: Filters panel adapts when the viewport changes
Opening or closing the **filters panel** SHALL NOT move the table. If the viewport crosses 744px while the **filters panel** is open, the system SHALL close it and discard the **filter draft**. From 320px upward the page SHALL NOT scroll horizontally, with the **filters panel** open or closed.

#### Scenario: Opening the panel does not move the table
- **GIVEN** players exist
- **AND** the visitor is on the player overview
- **WHEN** the visitor opens the filters panel
- **THEN** the table stays where it was

#### Scenario: Crossing the breakpoint closes the panel
- **GIVEN** a visitor is on the player overview with a viewport 1000px wide
- **AND** the visitor has opened the filters panel and chosen the nationality Poland
- **WHEN** the viewport becomes 600px wide
- **THEN** the filters panel is closed
- **AND** reopening it shows the filters that are applied

#### Scenario: Page does not scroll horizontally on a phone
- **GIVEN** the visitor has applied the nationality Czechia and the sex Female
- **WHEN** the visitor views the player overview with a viewport <width> wide and the filters panel <panel>
- **THEN** the page does not scroll horizontally

Examples:

| width | panel |
| --- | --- |
| 320px | closed |
| 320px | open |
| 375px | closed |
| 375px | open |

### Requirement: Page changes keep the visitor oriented
After the **visitor** changes the page, the system SHALL scroll to the top of the table, move focus to the table's caption, and announce the new summary in a polite live region. When the page returns to 1 because the **visitor** changed the view, the system SHALL NOT announce it as a page change.

#### Scenario: Moving to the next page
- **GIVEN** the visitor has scrolled to the pagination below the table on page 1
- **WHEN** the visitor goes to the next page
- **THEN** the top of the table is in view
- **AND** focus is on the table's caption
- **AND** the new summary, such as "Showing 26–50 of 100", is announced politely to screen readers

#### Scenario: A filter change is not announced as a page change
- **GIVEN** 100 players exist, 40 of them female
- **AND** the visitor is on page 2 of the player overview
- **WHEN** the visitor applies the sex Female
- **THEN** "Showing 1–25 of 40" is announced politely to screen readers only once
