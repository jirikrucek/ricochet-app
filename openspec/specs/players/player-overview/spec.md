# player-overview Specification

## Purpose

Lets a **visitor** see who plays Ricochet on the **player overview**. The **visitor** can sort **players** by surname, filter them by **nationality** and **sex**, and page through them, and can share or reload any view through its URL.

## Requirements

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

### Requirement: Nationality is shown as a flag with a localized country name
The system SHALL show a **player**'s **nationality** as a flag only. Each flag SHALL have an accessible name and a tooltip, both giving the country name in the current UI language.

#### Scenario: Flag named in the current UI language
- **GIVEN** the active UI language is Czech
- **AND** a player with nationality DE exists
- **WHEN** a screen reader reaches that player's flag
- **THEN** it announces "Německo"

#### Scenario: Tooltip shows the country name
- **GIVEN** the active UI language is English
- **AND** a player with nationality HU exists
- **WHEN** the visitor hovers over or focuses that player's flag
- **THEN** a tooltip reads "Hungary"

### Requirement: Players are sorted by surname
The system SHALL sort **players** by surname, ascending by default. Sorting SHALL be case-insensitive and follow the collation rules of the current UI language. It SHALL ignore the **surname prefix**, then break ties by first name, then by **surname suffix**, with no **surname suffix** first when ascending. Descending order SHALL reverse every key.

#### Scenario: Default order is ascending by surname
- **GIVEN** players with the surnames "Wagner", "Bakker", and "Nagy" exist
- **WHEN** a visitor opens the player overview
- **THEN** the players are listed in the order Bakker, Nagy, Wagner

#### Scenario: Surname prefix is ignored when sorting
- **GIVEN** players "Anna Bakker", "Pieter de Vries", and "Jan Novák" exist
- **WHEN** a visitor opens the player overview
- **THEN** the players are listed in the order Bakker, Novák, de Vries

#### Scenario: Sorting ignores letter case
- **GIVEN** players with the surnames "MacDonald" and "Macbeth" exist
- **WHEN** a visitor opens the player overview
- **THEN** "Macbeth" is listed before "MacDonald"

#### Scenario: Sorting follows the current UI language
- **GIVEN** players with the surnames "Horák" and "Chládek" exist
- **WHEN** a visitor opens the player overview in Czech
- **THEN** "Horák" is listed before "Chládek"
- **BUT** in English "Chládek" is listed before "Horák"

#### Scenario: Shared surname is ordered by first name
- **GIVEN** players "Petra Szabó" and "Anna Szabó" exist
- **WHEN** a visitor opens the player overview
- **THEN** Anna Szabó is listed before Petra Szabó

#### Scenario: Same name is ordered by surname suffix
- **GIVEN** players "Tomáš Kovář sr.", "Tomáš Kovář jr.", and "Tomáš Kovář" exist
- **WHEN** a visitor opens the player overview
- **THEN** they are listed in the order "Kovář", "Kovář jr.", "Kovář sr."

#### Scenario: Descending order reverses every key
- **GIVEN** players "Anna Bakker", "Tomáš Kovář", "Tomáš Kovář jr.", and "Pieter de Vries" exist
- **WHEN** the visitor sorts the Surname column descending
- **THEN** the players are listed in the order de Vries, Kovář jr., Kovář, Bakker

### Requirement: Surname column header toggles and announces the sort direction
The system SHALL let the **visitor** switch the sort direction by activating the Surname column header. The header SHALL show the current direction visually and expose it to assistive technology through `aria-sort`.

#### Scenario: Switching to descending
- **GIVEN** the player overview is sorted ascending
- **WHEN** the visitor activates the Surname column header
- **THEN** the players are sorted descending by surname
- **AND** the Surname header shows a descending indicator and reports `aria-sort="descending"`

#### Scenario: Switching back to ascending
- **GIVEN** the player overview is sorted descending
- **WHEN** the visitor activates the Surname column header
- **THEN** the players are sorted ascending by surname
- **AND** the Surname header reports `aria-sort="ascending"`

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

### Requirement: Player overview is paginated with a fixed page size
The system SHALL show the filtered and sorted **players** one page at a time, with 25 **players** per page. The **visitor** SHALL NOT be able to choose another page size. Below the table it SHALL show a summary of which **players** are shown out of the filtered total.

#### Scenario: First page
- **GIVEN** 100 players exist
- **WHEN** a visitor opens the player overview
- **THEN** 25 players are listed
- **AND** the summary reads "Showing 1–25 of 100"

#### Scenario: Last page shows the remaining players
- **GIVEN** 100 players exist, 40 of them female
- **AND** the visitor has filtered by the sex Female and is on page 1
- **WHEN** the visitor goes to the next page
- **THEN** 15 players are listed
- **AND** the summary reads "Showing 26–40 of 40"

#### Scenario: Page size cannot be chosen
- **GIVEN** 100 players exist
- **WHEN** a visitor opens the player overview
- **THEN** no control for choosing the number of players per page is shown

#### Scenario: Summary counts only filtered players
- **GIVEN** 100 players exist, 40 of them female
- **WHEN** the visitor filters by the sex Female
- **THEN** the summary reads "Showing 1–25 of 40"

### Requirement: Only the shown page of players is loaded
The system SHALL load only the **players** of the page being shown, with the backend applying the filters, the sort order, and the page. It SHALL NOT download the full list of **players** to the browser.

#### Scenario: Opening the overview loads one page
- **GIVEN** 100 players exist
- **WHEN** a visitor opens the player overview
- **THEN** the browser receives 25 players

#### Scenario: Filtering is answered by the backend
- **GIVEN** 100 players exist, 4 of them with nationality HU
- **WHEN** the visitor filters by the nationality Hungary
- **THEN** the browser receives only those 4 players

### Requirement: Page links show a compact page range on wide screens
From 744px upward the system SHALL show numbered page links with Previous and Next. The links SHALL include the first page, the last page, and the current page with one page on each side, with an ellipsis for each gap of two or more pages. A gap of exactly one page SHALL show that page's number instead of an ellipsis. The current page SHALL be marked with `aria-current="page"`. Previous SHALL be disabled on the first page and Next on the last page.

#### Scenario: First page of several
- **GIVEN** 250 players exist
- **WHEN** the visitor is on page 1
- **THEN** the page links read "Previous 1 2 … 10 Next"
- **AND** page 1 is marked as the current page
- **AND** Previous is disabled

#### Scenario: Last page disables Next
- **GIVEN** 250 players exist
- **WHEN** the visitor is on page 10
- **THEN** the page links read "Previous 1 … 9 10 Next"
- **AND** page 10 is marked as the current page
- **AND** Next is disabled

#### Scenario: Gaps collapse into ellipses
- **GIVEN** 250 players exist
- **WHEN** the visitor is on page 5
- **THEN** the page links read "Previous 1 … 4 5 6 … 10 Next"

#### Scenario: One-page gap shows the page number
- **GIVEN** 100 players exist
- **WHEN** the visitor is on page 1
- **THEN** the page links read "Previous 1 2 3 4 Next" with no ellipsis

#### Scenario: Going to a numbered page
- **GIVEN** 250 players exist
- **AND** the visitor is on page 1
- **WHEN** the visitor activates the link to page 10
- **THEN** the summary reads "Showing 226–250 of 250"

### Requirement: Pagination compacts below 744px
Below 744px the system SHALL replace the numbered page links with "Previous · Page N of M · Next", and SHALL stack the summary above them.

#### Scenario: Compact pagination on a phone
- **GIVEN** 100 players exist
- **AND** the visitor is on page 2 with a viewport 375px wide
- **WHEN** the pagination is shown
- **THEN** it reads "Previous · Page 2 of 4 · Next" with no numbered page links
- **AND** the summary is stacked above it
- **AND** the page does not scroll horizontally

### Requirement: Pagination hides what does not apply
When all filtered **players** fit on one page, the system SHALL hide the page links but keep the summary. When no **players** match, the system SHALL hide all pagination.

#### Scenario: One page of results
- **GIVEN** 100 players exist, 4 of them with nationality HU
- **WHEN** the visitor filters by the nationality Hungary
- **THEN** the summary reads "Showing 1–4 of 4"
- **AND** no page links are shown

#### Scenario: No results
- **GIVEN** no female players with nationality GB exist
- **WHEN** the visitor filters by the nationality United Kingdom and the sex Female
- **THEN** no summary or page links are shown

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

### Requirement: Player data is public and read-only
The system SHALL let every **visitor**, signed in or not, read the **players**. No **visitor** SHALL be able to add, change, or delete a **player**.

#### Scenario: Anonymous visitor reads players
- **GIVEN** a visitor is not signed in
- **WHEN** the visitor opens the player overview
- **THEN** the players are listed

#### Scenario: Visitor cannot change player data
- **GIVEN** a visitor is not signed in
- **WHEN** the visitor tries to add, change, or delete a player through the public data API
- **THEN** the request is refused
- **AND** the players are unchanged
