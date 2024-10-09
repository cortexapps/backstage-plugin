# Changelog

### 2.13.5

- Truncate initiative descriptions to 10 lines

### 2.12.4

- Performance improvements for the Bird's Eye report
- Depends on Cortex version 0.0.336

### 2.12.3

- Use @cortexapps/birdseye from NPM registry

### 2.12.2

- Add Cortex service groups to Scorecard scores Groups filter.

### 2.12.1

- Add closing button to the Bird's Eye filter dialog
- Improve mutliselect behavior in the filter dialog

### 2.12.0

- Bird's Eye widget is using `@cortexapps/birdseye` package
- Depends on Cortex version 0.0.331

### 2.11.7

- Add indicator explaining that grouping by domain is not available for historical reports.

### 2.11.6

- Add show my entities filter in Initiatives page

### 2.11.5

- Update how we display Initiative target date

### 2.11.4

- Fix Bird's Eye Report throwing error when it included archived entities

### 2.11.3

- Fix for opening Initiative filtered by email owner who doesn't exist

### 2.11.2

- Reset the Initiative filters modal when the modal is closed without applying the filters

### 2.11.1

- Fix date offset on Initiative detail page

### 2.11.0

- Add the ability to filter by email owner on the Initiative details page
- Persist filters in the URL on the Initiative details page
- Performance improvements for the Initiative details page

### 2.10.2

- Fix disabling levels hierarchy breadcrumbs correctly

### 2.10.1

- Fix table measure bug for new breadcrumb options

### 2.10.0

- Backstage version update from 1.25.2 to 1.27.7

### 2.9.2

- Fix breadcrumbs on non-hierarchy items

### 2.9.1

- Fix incorrect logic around group by changes and hierarchy

### 2.9.0

- Add filters to the Bird's Eye Report
- Add team and domain hierarchies to the Bird's Eye Report
- Add option to group by domain to the Bird's Eye Report

### 2.8.0

- Display Initiatives notification schedule

### 2.7.2

- Fix incorrect re-rendering of Bird's eye report by levels

### 2.7.1

- Fix timestamp format on Settings page

### 2.7.0

- Adds `header.title` and `header.subtitle` YAML config to customize Cortex page title and subtitle
- Adds `hideCortexLinks` YAML flag to hide all links to Cortex app
- Adds `initiativeNameOverride` YAML config to override "Initiative" name

### 2.6.6

- Fix rule description and rule query text colors

### 2.6.5

- Fix issue where groups filters are not rendered correctly in metadata on Initiative page

### 2.6.4

- Fix issue where markdown is rendered as plain text on Scorecard service page

### 2.6.3

- Fix issue where rule evaluation error is not displayed

### 2.6.2

- Fix issue where resolve hint is displayed for passing rule

### 2.6.1

- Reports filters determined from URL are now also persisted in URL after change
- Fix confusing Group By options in Bird's eye view
- Fix entity link to target the entity performance on the Scorecard instead of the entity detail

### 2.6.0

- Backstage version update from 1.12.1 to 1.25.2

### 2.5.3

- Fix an issue where an invalid link is generated when there is insufficient information about an entity in the context

### 2.5.2

- Fix entity links by applying the correct `kind` instead of always assuming they are `Component`s

### 2.5.1

- Fix label color (light theme)

### 2.5.0

- Overhaul the UI of Scorecard pages with better visualization of rules & levels
- Overhaul the UI of Initiative pages
- Add a "Copy to CSV" button for exporting Scorecard scores

### 2.4.4

- Add support for non ISO-8859-1 characters in request headers to the Cortex API. This fixes authentication for users with these characters in their name.

### 2.4.3

- Show expiration banner when Cortex access is expiring & block access after expiration.

### 2.4.2

- Add indicator explaining that grouping by level is not available for historical reports.

### 2.4.1

- Handle conflicting/duplicate Backstage ↔ Cortex syncs

### 2.4.0

- Adds the ability to filter which entities get sent from Backstage to Cortex (via [backstage-plugin-extensions)](https://github.com/cortexapps/backstage-plugin-extensions)

### 2.3.3

- Chunks the Backstage ↔ Cortex sync job to improve resilience and success rate

### 2.3.2

- Automatically strips a trailing/double slash on Scorecard links

### 2.3.1

- Automatically strips the “Bearer” prefix from the auth token if it exists, to prevent a common mistake

### 2.3.0

- Exposes rule filters on the Scorecard details page, and marks rules excluded by a rule filter as ignored

### 2.2.0

- Adds ability to add badges to Scorecards based on extension criteria (via [backstage-plugin-extensions)](https://github.com/cortexapps/backstage-plugin-extensions)
- Adds “Back” link to the Scorecard service page
- Adds Help Links page to Settings with a configurable set of links

### 2.1.1

- Fix TypeScript typing of `hideSettings` flag

### 2.1.0

- Adds table in Settings page displaying current and historical Backstage ↔ Cortex sync jobs

### 2.0.5

- Adds dropdowns to sort Scorecards based on various criteria
- Update Scorecard search placeholder
- Adds due date and a sort dropdown to Initiatives

### 2.0.4

- Add support for custom Scorecard support order (via [backstage-plugin-extensions](https://github.com/cortexapps/backstage-plugin-extensions))

### 2.0.3

- Adds the ability to search for Scorecards by text
- Adds “No Scorecards” state instead of showing a blank screen
- Adds `hideSettings` flag to fully hide the settings page for all users

### 2.0.2

- Display entity name instead of entity tag on report columns

### 2.0.1

- Copy updates

**NOTE:** 2.0.0 and prior are not documented. See [commit history](https://github.com/cortexapps/backstage-plugin/commits/master) for details.
