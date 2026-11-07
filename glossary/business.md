| Term | Definition | Use When | Avoid |
| --- | --- | --- | --- |
| Visitor | Anyone using the app in a browser, signed in or not. | Describing who sees or interacts with a page in specs and scenarios. | user, customer |
| Player | A person who plays Ricochet and is recorded in the app. | Referring to the people listed, sorted, and filtered in the app. | athlete, member, competitor |
| Player overview | The page listing all players with their surname, first name, and nationality, sortable by surname, filterable by nationality and sex, and paginated. | Naming the `/players` page or its capability. | player list, player directory, roster |
| Nationality | The country a player represents, stored as an ISO 3166-1 alpha-2 code (e.g. CZ, DE). | Referring to a player's country attribute or the nationality filter. | country (except when quoting the source ranking list) |
| Sex | A player's sex, either male or female. | Referring to the player attribute or the sex filter. | gender |
| Surname prefix | An optional particle written before the surname (e.g. "de", "van", "ter") that is shown but ignored when sorting. | Modelling or displaying names like "de Vries". | tussenvoegsel, particle (in specs) |
| Surname suffix | An optional generational marker written after the surname (e.g. "jr.", "sr.") that is shown and used as the last sort tie-breaker. | Modelling or displaying names like "Smith jr.". | name suffix, title |
| Filter | A single-select control that narrows a list to the rows matching one chosen option, where the option "All" means no narrowing. | Naming a control such as the nationality filter or the sex filter. | facet, refinement |
| Filters button | The one button above a list that shows how many filters are applied and opens the filters panel. | Describing how a visitor reaches the filters of any list. | filter toggle, filter menu |
| Filters panel | The area opened by the filters button that holds one filter per attribute and an Apply button, shown as a popover on wide screens and as a sheet on narrow ones. | Describing where a visitor chooses and applies filters. | filter drawer, filter dropdown |
| Applied filter | A filter whose chosen option is not "All", shown as a removable chip beside the filters button. | Describing which filters currently narrow a list. | active filter, selected filter |
| Filter draft | The options chosen in the filters panel but not yet applied, which are discarded when the panel closes without Apply. | Describing what a visitor has picked before clicking Apply. | pending filters, staged filters |
