## ADDED Requirements

### Requirement: Filters are chosen in a filters panel
The system SHALL show one **filters button** above the table in place of the **filters**. Activating it SHALL open the **filters panel**, which holds the **nationality** filter, the **sex** filter, and an Apply button.

#### Scenario: Filters stay out of the way until asked for
- **GIVEN** players exist
- **WHEN** a visitor opens the player overview
- **THEN** a Filters button is shown above the table
- **AND** no nationality or sex filter is shown

### Requirement: Apply commits the filter draft
Choosing an option in the **filters panel** SHALL change only the **filter draft**. Apply SHALL apply the whole **filter draft** at once and collapse the **filters panel**. Closing the **filters panel** in any other way SHALL discard the **filter draft**, so that reopening it shows the filters that are applied.

#### Scenario: Choosing options does not apply them
- **GIVEN** players with the nationalities CZ and PL exist
- **AND** the visitor has opened the filters panel
- **WHEN** the visitor chooses the nationality Poland
- **THEN** the listed players do not change

#### Scenario: Apply applies the draft and collapses the panel
- **GIVEN** male and female players with the nationalities CZ and PL exist
- **AND** the visitor has opened the filters panel
- **WHEN** the visitor chooses the nationality Poland and the sex Male
- **AND** the visitor activates Apply
- **THEN** only male players with nationality PL are listed
- **AND** the filters panel is closed

#### Scenario: Closing without Apply discards the draft
- **GIVEN** players with the nationalities CZ, DE, and PL exist
- **AND** the player overview is filtered by the nationality Germany
- **WHEN** the visitor opens the filters panel, chooses the nationality Poland, and closes the panel without Apply
- **THEN** only players with nationality DE are listed
- **AND** reopening the filters panel shows the nationality Germany

### Requirement: Filters panel is a popover on wide screens
From 744px upward the system SHALL show the **filters panel** as a **popover** anchored to the **filters button**. The **popover** SHALL NOT dim the page, and SHALL close when the **visitor** clicks outside it.

#### Scenario: Popover on a wide screen
- **GIVEN** a visitor is on the player overview with a viewport 1000px wide
- **WHEN** the visitor opens the filters panel
- **THEN** the filters panel is shown next to the Filters button
- **AND** the table is not dimmed

#### Scenario: Popover closes on an outside click
- **GIVEN** a visitor is on the player overview with a viewport 1000px wide
- **AND** the visitor has opened the filters panel and chosen the nationality Poland
- **WHEN** the visitor clicks outside the filters panel
- **THEN** the filters panel is closed
- **AND** the listed players do not change

### Requirement: Filters panel is a sheet on narrow screens
Below 744px the system SHALL show the **filters panel** as a **sheet** that slides up from the bottom edge over a dimmed page, keeps focus inside until it is closed, and scrolls when it is taller than the viewport.

#### Scenario: Sheet on a phone
- **GIVEN** a visitor is on the player overview with a viewport 375px wide
- **WHEN** the visitor opens the filters panel
- **THEN** the filters panel slides up from the bottom edge over a dimmed page
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

### Requirement: Filters panel can be used with a keyboard
The **filters button** SHALL be reachable and operable with the keyboard and SHALL tell assistive technology whether the **filters panel** is open. Escape SHALL close the **filters panel** and return focus to the **filters button**. The **sheet** SHALL keep Tab inside it while it is open. The **popover** SHALL NOT trap focus.

#### Scenario: Opening with the keyboard
- **GIVEN** the visitor has moved focus to the Filters button with the keyboard
- **WHEN** the visitor presses Enter
- **THEN** the filters panel is open
- **AND** the Filters button reports that the panel is expanded

#### Scenario: Closing with Escape
- **GIVEN** the visitor has opened the filters panel with the keyboard
- **WHEN** the visitor presses Escape
- **THEN** the filters panel is closed
- **AND** focus is on the Filters button

#### Scenario: Tab stays inside the sheet
- **GIVEN** a visitor is on the player overview with a viewport 375px wide
- **AND** the filters panel is open
- **WHEN** the visitor presses Tab past the last control in the filters panel
- **THEN** focus moves to the first control in the filters panel

### Requirement: Applied filters are shown beside the filters button
The **filters button** SHALL show how many **filters** are applied whenever at least one is. Each **applied filter** SHALL be shown as a chip beside the **filters button**, and the **nationality** chip SHALL show the flag and the country name. Activating a chip SHALL remove that **applied filter**. When no **filter** is applied, no count and no chip SHALL be shown.

#### Scenario: No filter applied
- **GIVEN** players exist
- **WHEN** a visitor opens the player overview
- **THEN** the Filters button shows no count
- **AND** no chips are shown

#### Scenario: Applied filters are visible with the panel closed
- **GIVEN** the visitor has applied the nationality Czechia and the sex Female
- **WHEN** the filters panel is closed
- **THEN** the Filters button shows the count 2
- **AND** a chip with the Czech flag and "Czechia" is shown
- **AND** a chip "Female" is shown

#### Scenario: Removing one applied filter
- **GIVEN** the visitor has applied the nationality Czechia and the sex Female
- **WHEN** the visitor removes the "Female" chip
- **THEN** players of both sexes with nationality CZ are listed
- **AND** the Filters button shows the count 1
- **AND** only the "Czechia" chip remains

### Requirement: Clear all filters removes every applied filter at once
Whenever at least one **filter** is applied, the system SHALL show one Clear all filters action beside the chips that removes all of them. It SHALL be the only action for clearing every **filter**, including when no **players** match.

#### Scenario: Clear all filters is offered with one applied filter
- **GIVEN** the visitor has applied only the sex Female
- **WHEN** the filters panel is closed
- **THEN** a Clear all filters action is shown beside the chip

#### Scenario: Clear all filters is not shown without applied filters
- **GIVEN** no filter is applied
- **WHEN** a visitor opens the player overview
- **THEN** no Clear all filters action is shown

#### Scenario: Clearing all applied filters
- **GIVEN** the visitor has applied the nationality Czechia and the sex Female
- **WHEN** the visitor activates Clear all filters
- **THEN** players of every nationality and sex are listed
- **AND** no chips are shown

### Requirement: Filter changes keep the visitor oriented
After the **visitor** applies filters, removes an **applied filter**, or uses Clear all filters, the system SHALL return focus to the **filters button**. Once the new **players** are shown, it SHALL announce the result in a polite live region: the summary, or the message that no **players** match. When the change leaves the view as it was, it SHALL announce the current result straight away.

#### Scenario: Applying filters announces the result
- **GIVEN** 100 players exist, 40 of them female
- **AND** the visitor has opened the filters panel and chosen the sex Female
- **WHEN** the visitor activates Apply
- **THEN** focus is on the Filters button
- **AND** "Showing 1–25 of 40" is announced politely to screen readers

#### Scenario: Removing a chip announces the result
- **GIVEN** 100 players exist, 40 of them female
- **AND** the visitor has applied the sex Female
- **WHEN** the visitor removes the "Female" chip
- **THEN** focus is on the Filters button
- **AND** "Showing 1–25 of 100" is announced politely to screen readers

#### Scenario: No match announced
- **GIVEN** no female players with nationality GB exist
- **WHEN** the visitor applies the nationality United Kingdom and the sex Female
- **THEN** focus is on the Filters button
- **AND** "No players match the selected filters" is announced politely to screen readers

#### Scenario: Applying without a change
- **GIVEN** the visitor has applied the sex Female and the player overview shows "Showing 1–25 of 40"
- **WHEN** the visitor opens the filters panel and activates Apply without changing anything
- **THEN** focus is on the Filters button
- **AND** "Showing 1–25 of 40" is announced politely to screen readers

### Requirement: Filters combine with AND
The system SHALL combine the **nationality** and **sex** filters with AND.

#### Scenario: Both filters applied together
- **GIVEN** male and female players with the nationalities CZ and PL exist
- **WHEN** the visitor chooses the nationality Poland and the sex Male in the filters panel and activates Apply
- **THEN** only male players with nationality PL are listed

## MODIFIED Requirements

### Requirement: Visitor can filter players by nationality
The system SHALL offer a single-select **nationality** filter in the **filters panel**. Its first option SHALL be "All", which is the default. Its other options SHALL show a flag with the country name in the current UI language, and SHALL offer the **nationalities** of existing **players** and nothing else, apart from the **nationality** that is applied, which stays offered even when no **player** has it, so that it can always be seen and removed.

#### Scenario: Filtering by one nationality
- **GIVEN** players with the nationalities CZ, DE, and PL exist
- **WHEN** the visitor chooses the nationality Germany in the filters panel and activates Apply
- **THEN** only players with nationality DE are listed

#### Scenario: Only nationalities present among players are offered
- **GIVEN** players exist only with the nationalities CZ and NL
- **WHEN** the visitor opens the nationality filter in the filters panel
- **THEN** the options are All, Czechia, and Netherlands, each country with its flag

#### Scenario: An applied nationality that no player has stays offered
- **GIVEN** players exist only with the nationalities CZ and NL
- **WHEN** a visitor opens a link to the player overview filtered by the nationality United Kingdom
- **THEN** the Filters button shows the count 1
- **AND** a chip with the United Kingdom flag and "United Kingdom" is shown with Clear all filters

#### Scenario: Returning to all nationalities
- **GIVEN** the player overview is filtered by the nationality Germany
- **WHEN** the visitor chooses "All" in the nationality filter and activates Apply
- **THEN** players of every nationality are listed

### Requirement: Visitor can filter players by sex
The system SHALL offer a single-select **sex** filter in the **filters panel** with the options All (the default), Male, and Female, labelled in the current UI language.

#### Scenario: Filtering by sex
- **GIVEN** male and female players exist
- **WHEN** the visitor chooses the sex Female in the filters panel and activates Apply
- **THEN** only female players are listed

#### Scenario: Sex labels follow the current UI language
- **GIVEN** the active UI language is German
- **WHEN** the visitor opens the sex filter in the filters panel
- **THEN** the options are shown in German

### Requirement: Changing the view returns to the first page
The system SHALL return to page 1 whenever the **visitor** applies filters, removes an **applied filter**, uses Clear all filters, or changes the sort direction. Each of these SHALL be one step in the browser history.

#### Scenario: View change resets the page
- **GIVEN** the visitor is on page 2 of the player overview
- **WHEN** the visitor <changes the view>
- **THEN** page 1 is shown

Examples:

| changes the view |
| --- |
| applies filters |
| removes an applied filter |
| uses Clear all filters |
| switches the sort direction |

#### Scenario: Applying two filters is one history step
- **GIVEN** the player overview showed every player
- **AND** the visitor has applied the nationality Poland and the sex Male in one Apply
- **WHEN** the visitor goes back in the browser
- **THEN** every player is listed again

### Requirement: The view is kept in the URL
The system SHALL keep the sort direction, the filters, and the page (`page`) in the URL search params, so a view can be shared, reloaded, and walked through with back and forward. Default values SHALL be left out of the URL. Invalid values SHALL fall back to their defaults, unknown params SHALL be ignored, and a `page` beyond the last page SHALL fall back to page 1.

#### Scenario: Shared link opens the same view
- **GIVEN** 40 female players exist
- **AND** a visitor has filtered by the sex Female, sorted descending, and gone to page 2
- **WHEN** another visitor opens the same URL
- **THEN** they see female players sorted descending
- **AND** the summary reads "Showing 26–40 of 40"

#### Scenario: Reload keeps the view
- **GIVEN** a visitor has filtered by the sex Male
- **WHEN** the visitor reloads the page
- **THEN** the player overview is still filtered by the sex Male

#### Scenario: Back and forward walk through views
- **GIVEN** a visitor has gone from page 1 to page 2
- **WHEN** the visitor goes back in the browser
- **THEN** page 1 is shown
- **AND** going forward shows page 2 again

#### Scenario: Default view has a clean URL
- **GIVEN** a visitor has filtered by the sex Female
- **WHEN** the visitor removes the sex chip
- **THEN** the URL is `/players` with no search params

#### Scenario: Invalid URL values fall back to the defaults
- **GIVEN** 100 players exist
- **WHEN** a visitor opens `/players?<search params>`
- **THEN** the player overview shows <outcome>

Examples:

| search params | outcome |
| --- | --- |
| `pageSize=50` | 25 players per page |
| `page=abc` | page 1 |
| `page=9` | page 1 |
| an unknown nationality code | players of every nationality |
| an unknown sex | players of both sexes |
| an unknown sort direction | players sorted ascending |

### Requirement: Player overview shows loading, error, and empty states
The system SHALL show a loading state while **players** are being fetched. If fetching fails, it SHALL show an error message with a Retry action and report the failure per the observability standard. If no **players** exist, it SHALL show "No players yet". If **players** exist but none match the filters, it SHALL show "No players match the selected filters", and the **applied filters** with Clear all filters SHALL stay shown beside the **filters button**.

#### Scenario: Loading
- **GIVEN** players are still being fetched
- **WHEN** a visitor opens the player overview
- **THEN** a loading state is shown in place of the table

#### Scenario: Fetching fails
- **GIVEN** the player data cannot be fetched
- **WHEN** a visitor opens the player overview
- **THEN** an error message with a Retry action is shown
- **AND** the failure is reported to error monitoring

#### Scenario: Retry after a failure
- **GIVEN** the player overview shows the error message
- **AND** the player data can now be fetched
- **WHEN** the visitor activates Retry
- **THEN** the players are listed

#### Scenario: No players exist
- **GIVEN** no players exist
- **WHEN** a visitor opens the player overview
- **THEN** "No players yet" is shown
- **AND** no pagination is shown

#### Scenario: No players match the filters
- **GIVEN** no female players with nationality GB exist
- **WHEN** the visitor applies the nationality United Kingdom and the sex Female
- **THEN** "No players match the selected filters" is shown
- **AND** chips for the nationality United Kingdom and the sex Female are shown with Clear all filters

#### Scenario: Clearing filters from the no-match state
- **GIVEN** the visitor has applied the nationality United Kingdom and the sex Female, which matches no players
- **WHEN** the visitor activates Clear all filters
- **THEN** both filters return to "All"
- **AND** players of every nationality and sex are listed on page 1

### Requirement: Player overview is translated into every supported UI language
The system SHALL show all **player overview** text, including headings, column headers, the **filters button**, the **filters panel** and its labels and options, **applied filter** chips, Clear all filters, the live announcements, country names, **sex** labels, pagination, summaries, and state messages, in each of the six supported UI languages.

#### Scenario: Page text follows the UI language
- **GIVEN** the active UI language is <language>
- **WHEN** a visitor opens the player overview
- **THEN** the column headers, the Filters button, and pagination are shown in <language>

Examples:

| language |
| --- |
| English |
| Czech |
| German |
| Polish |
| Dutch |
| Hungarian |

#### Scenario: Filters panel text follows the UI language
- **GIVEN** the active UI language is <language>
- **WHEN** the visitor opens the filters panel
- **THEN** its title, labels, options, and Apply button are shown in <language>

Examples:

| language |
| --- |
| English |
| Czech |
| German |
| Polish |
| Dutch |
| Hungarian |

## REMOVED Requirements

### Requirement: Filters combine and adapt to narrow screens
**Reason**: The **filters** are no longer shown above the table. They live in the **filters panel**, which has its own popover and sheet behaviour (see "Filters panel is a popover on wide screens" and "Filters panel is a sheet on narrow screens"). The AND rule moves to "Filters combine with AND".

**Migration**: Use the requirements "Filters combine with AND", "Filters panel is a popover on wide screens", "Filters panel is a sheet on narrow screens", and "Filters panel adapts when the viewport changes". The scenario "Filters stack on a phone" has no successor, because there is nothing to stack.
