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
The system SHALL show a single-select **nationality** filter above the table. Its first option SHALL be "All", which is the default. Its other options SHALL show a flag with the country name in the current UI language, and SHALL offer only the **nationalities** of existing **players**.

#### Scenario: Filtering by one nationality
- **GIVEN** players with the nationalities CZ, DE, and PL exist
- **WHEN** the visitor filters by the nationality Germany
- **THEN** only players with nationality DE are listed

#### Scenario: Only nationalities present among players are offered
- **GIVEN** players exist only with the nationalities CZ and NL
- **WHEN** the visitor opens the nationality filter
- **THEN** the options are All, Czechia, and Netherlands, each country with its flag

#### Scenario: Returning to all nationalities
- **GIVEN** the player overview is filtered by the nationality Germany
- **WHEN** the visitor chooses "All" in the nationality filter
- **THEN** players of every nationality are listed

### Requirement: Visitor can filter players by sex
The system SHALL show a single-select **sex** filter above the table with the options All (the default), Male, and Female, labelled in the current UI language.

#### Scenario: Filtering by sex
- **GIVEN** male and female players exist
- **WHEN** the visitor filters by the sex Female
- **THEN** only female players are listed

#### Scenario: Sex labels follow the current UI language
- **GIVEN** the active UI language is German
- **WHEN** the visitor opens the sex filter
- **THEN** the options are shown in German

### Requirement: Filters combine and adapt to narrow screens
The system SHALL combine the **nationality** and **sex** filters with AND. Below 744px the filters SHALL stack vertically.

#### Scenario: Both filters applied together
- **GIVEN** male and female players with the nationalities CZ and PL exist
- **WHEN** the visitor filters by the nationality Poland and the sex Male
- **THEN** only male players with nationality PL are listed

#### Scenario: Filters stack on a phone
- **GIVEN** a visitor is on the player overview with a viewport 375px wide
- **WHEN** the filters are shown
- **THEN** the sex filter is shown below the nationality filter
- **AND** the page does not scroll horizontally

### Requirement: Player overview is paginated with a visitor-chosen page size
The system SHALL show the filtered and sorted **players** one page at a time. Below the table it SHALL show a "Players per page" selector with the options 10, 25 (the default), and 50, and a summary of which **players** are shown out of the filtered total.

#### Scenario: First page at the default page size
- **GIVEN** 100 players exist
- **WHEN** a visitor opens the player overview
- **THEN** 25 players are listed
- **AND** the summary reads "Showing 1–25 of 100"
- **AND** "Players per page" shows 25

#### Scenario: Last page shows the remaining players
- **GIVEN** 100 players exist, 40 of them female
- **AND** the visitor has filtered by the sex Female and is on page 1
- **WHEN** the visitor goes to the next page
- **THEN** 15 players are listed
- **AND** the summary reads "Showing 26–40 of 40"

#### Scenario: Changing the page size
- **GIVEN** 100 players exist
- **WHEN** the visitor chooses 10 players per page
- **THEN** 10 players are listed
- **AND** the summary reads "Showing 1–10 of 100"
- **AND** there are 10 pages

#### Scenario: Summary counts only filtered players
- **GIVEN** 100 players exist, 40 of them female
- **WHEN** the visitor filters by the sex Female
- **THEN** the summary reads "Showing 1–25 of 40"

### Requirement: Page links show a compact page range on wide screens
From 744px upward the system SHALL show numbered page links with Previous and Next. The links SHALL include the first page, the last page, and the current page with one page on each side, with an ellipsis for each gap of two or more pages. A gap of exactly one page SHALL show that page's number instead of an ellipsis. The current page SHALL be marked with `aria-current="page"`. Previous SHALL be disabled on the first page and Next on the last page.

#### Scenario: First page of several
- **GIVEN** 100 players exist
- **AND** the visitor has chosen 10 players per page
- **WHEN** the visitor is on page 1
- **THEN** the page links read "Previous 1 2 … 10 Next"
- **AND** page 1 is marked as the current page
- **AND** Previous is disabled

#### Scenario: Last page disables Next
- **GIVEN** 100 players exist
- **AND** the visitor has chosen 10 players per page
- **WHEN** the visitor is on page 10
- **THEN** the page links read "Previous 1 … 9 10 Next"
- **AND** page 10 is marked as the current page
- **AND** Next is disabled

#### Scenario: Gaps collapse into ellipses
- **GIVEN** 100 players exist
- **AND** the visitor has chosen 10 players per page
- **WHEN** the visitor is on page 5
- **THEN** the page links read "Previous 1 … 4 5 6 … 10 Next"

#### Scenario: One-page gap shows the page number
- **GIVEN** 100 players exist
- **WHEN** the visitor is on page 1 at the default 25 players per page
- **THEN** the page links read "Previous 1 2 3 4 Next" with no ellipsis

#### Scenario: Going to a numbered page
- **GIVEN** 100 players exist
- **AND** the visitor has chosen 10 players per page and is on page 1
- **WHEN** the visitor activates the link to page 10
- **THEN** the summary reads "Showing 91–100 of 100"

### Requirement: Pagination compacts below 744px
Below 744px the system SHALL replace the numbered page links with "Previous · Page N of M · Next", and SHALL stack the summary and the "Players per page" selector above them.

#### Scenario: Compact pagination on a phone
- **GIVEN** 100 players exist
- **AND** the visitor is on page 2 with a viewport 375px wide
- **WHEN** the pagination is shown
- **THEN** it reads "Previous · Page 2 of 4 · Next" with no numbered page links
- **AND** the summary and the "Players per page" selector are stacked above it
- **AND** the page does not scroll horizontally

### Requirement: Pagination hides what does not apply
When all filtered **players** fit on one page, the system SHALL hide the page links but keep the summary and the "Players per page" selector. When no **players** match, the system SHALL hide all pagination.

#### Scenario: One page of results
- **GIVEN** 100 players exist, 4 of them with nationality HU
- **WHEN** the visitor filters by the nationality Hungary
- **THEN** the summary reads "Showing 1–4 of 4"
- **AND** the "Players per page" selector is shown
- **AND** no page links are shown

#### Scenario: No results
- **GIVEN** no female players with nationality GB exist
- **WHEN** the visitor filters by the nationality United Kingdom and the sex Female
- **THEN** no summary, "Players per page" selector, or page links are shown

### Requirement: Changing the view returns to the first page
The system SHALL return to page 1 whenever the **visitor** changes a filter, the sort direction, or the page size, or uses Clear filters.

#### Scenario: View change resets the page
- **GIVEN** the visitor is on page 2 of the player overview
- **WHEN** the visitor <changes the view>
- **THEN** page 1 is shown

Examples:

| changes the view |
| --- |
| filters by a nationality |
| filters by a sex |
| switches the sort direction |
| chooses another page size |
| uses Clear filters |

### Requirement: Page changes keep the visitor oriented
After the **visitor** changes the page, the system SHALL scroll to the top of the table, move focus to the table's caption, and announce the new summary in a polite live region.

#### Scenario: Moving to the next page
- **GIVEN** the visitor has scrolled to the pagination below the table on page 1
- **WHEN** the visitor goes to the next page
- **THEN** the top of the table is in view
- **AND** focus is on the table's caption
- **AND** the new summary, such as "Showing 26–50 of 100", is announced politely to screen readers

### Requirement: The view is kept in the URL
The system SHALL keep the sort direction, the filters, the page (`page`), and the page size (`pageSize`) in the URL search params, so a view can be shared, reloaded, and walked through with back and forward. Default values SHALL be left out of the URL. Invalid values SHALL fall back to their defaults, and a `page` beyond the last page SHALL fall back to page 1.

#### Scenario: Shared link opens the same view
- **GIVEN** 24 players with nationality CZ exist
- **AND** a visitor has filtered by the nationality Czechia, sorted descending, chosen 10 players per page, and gone to page 2
- **WHEN** another visitor opens the same URL
- **THEN** they see Czech players sorted descending, 10 per page
- **AND** the summary reads "Showing 11–20 of 24"

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
- **WHEN** the visitor chooses "All" in the sex filter
- **THEN** the URL is `/players` with no search params

#### Scenario: Invalid URL values fall back to the defaults
- **GIVEN** 100 players exist
- **WHEN** a visitor opens `/players?<search params>`
- **THEN** the player overview shows <outcome>

Examples:

| search params | outcome |
| --- | --- |
| `pageSize=7` | 25 players per page |
| `page=abc` | page 1 |
| `page=9` | page 1 |
| an unknown nationality code | players of every nationality |
| an unknown sex | players of both sexes |
| an unknown sort direction | players sorted ascending |

### Requirement: Player overview shows loading, error, and empty states
The system SHALL show a loading state while **players** are being fetched. If fetching fails, it SHALL show an error message with a Retry action and report the failure per the observability standard. If no **players** exist, it SHALL show "No players yet". If **players** exist but none match the filters, it SHALL show "No players match the selected filters" with a Clear filters action.

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
- **WHEN** the visitor filters by the nationality United Kingdom and the sex Female
- **THEN** "No players match the selected filters" is shown with a Clear filters action

#### Scenario: Clearing filters from the no-match state
- **GIVEN** the visitor has filtered by the nationality United Kingdom and the sex Female, which matches no players
- **WHEN** the visitor activates Clear filters
- **THEN** both filters return to "All"
- **AND** players of every nationality and sex are listed on page 1

### Requirement: Player overview is translated into every supported UI language
The system SHALL show all **player overview** text, including headings, column headers, filter labels and options, country names, **sex** labels, pagination, summaries, and state messages, in each of the six supported UI languages.

#### Scenario: Page text follows the UI language
- **GIVEN** the active UI language is <language>
- **WHEN** a visitor opens the player overview
- **THEN** the column headers, filter labels, and pagination are shown in <language>

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
