# Changelog

### 2.4.4

- Support non ISO-8859-1 characters in request headers.

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
