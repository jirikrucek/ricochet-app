## MODIFIED Requirements

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
The system SHALL return to page 1 whenever the **visitor** changes a filter or the sort direction, or uses Clear filters.

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
| uses Clear filters |

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
- **WHEN** the visitor chooses "All" in the sex filter
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

## ADDED Requirements

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

## REMOVED Requirements

### Requirement: Player overview is paginated with a visitor-chosen page size
**Reason**: The page size is now a constant that the **visitor** can't change. Replaced by "Player overview is paginated with a fixed page size".

**Migration**: A leftover `pageSize` in a shared link is ignored, and the view shows 25 **players** per page.
