# Cortex Scorecard Plugin for Backstage

![scorecards](./docs/screen1.png?raw=true)

[Cortex](https://www.getcortexapp.com/) is a tool for engineering teams to understand
and improve their services.

We’ve released our Scorecards product as a Backstage plugin.
[Scorecards](https://www.getcortexapp.com/products/scorecard) let you write
customizable rules to track and enforce service quality across the entire engineering org. Engineers can set reliability
standards across teams and types of services, by tracking the health of deploys, SLOs, on-call, vulnerabilities,
package versions, and more – all through direct integrations with tools like Datadog or Sonarqube. Service owners
receive points for passing the rules defined and see their service scores stack ranked with all other services in the
scorecard, turning service quality into a game.

Scorecards help keep teams accountable to best SRE / security / infra practices and are
especially powerful during migrations or tracking production readiness. The rules found
in a scorecard are powered through CQL (Cortex Query Language), a powerful DSL that
hooks into your 3rd party tooling and lets you define reliability as code. CQL lets
you write rules like "if the service is a production service, then there must be
an on-call rotation and greater than 85% test coverage."

Our plugin will automatically ingest all of your Backstage services and let you grade
the quality of them in the Cortex product. We sync scores with Backstage, and you’ll be
able to see the scores for each service in the catalog.

![plugin1](./docs/screen2.png?raw=true)
![plugin2](./docs/screen3.png?raw=true)

Cortex can even message service owners with weekly reports over Slack or email, showing changes in the
quality of the service. We also generate reports showing how different teams are
performing in their Scorecards.

To start using the Backstage plugin and see a demo, please [sign up here](https://www.getcortexapp.com/demo) and we will
reach out with more info!

## Setup and Integration

1. In the [packages/app](https://github.com/backstage/backstage/blob/master/packages/app/) directory of your backstage
   instance, add the plugin as a package.json dependency:

```shell
$ yarn add @cortexapps/backstage-plugin
```
2. Export the plugin in your app's [plugins.ts](https://github.com/backstage/backstage/blob/master/packages/app/src/plugins.ts)
   to enable the plugin:
```ts
export { cortexPlugin } from '@cortexapps/backstage-plugin'
```

3. Import page to [App.tsx](https://github.com/backstage/backstage/blob/master/packages/app/src/App.tsx):
```tsx
import { CortexPage } from '@cortexapps/backstage-plugin';
```

3. And add a new route to [App.tsx](https://github.com/backstage/backstage/blob/master/packages/app/src/App.tsx):

```tsx
<Route path="/cortex" element={<CortexPage />}/>
```

4. Update [app-config.yaml](https://github.com/backstage/backstage/blob/master/app-config.yaml) to add a new proxy
   config:
```yaml
'/cortex':
    target: ${CORTEX_BACKEND_HOST_URL}
    headers:
      Authorization: ${CORTEX_TOKEN}
```

5.Import `EntityCortexContent` and update [EntityPage.tsx](https://github.com/backstage/backstage/blob/master/packages/app/src/components/catalog/EntityPage.tsx) to add a new catalog tab for Cortex:
```tsx
import { EntityCortexContent } from '@cortexapps/backstage-plugin';

<EntityLayout.Route path="/cortex" title="Cortex">
  <EntityCortexContent/>
</EntityLayout.Route>
```

6. Add a new sidebar item in [Root.tsx](https://github.com/backstage/backstage/blob/master/packages/app/src/components/Root/Root.tsx)

```tsx
import { CortexIcon } from '@cortexapps/backstage-plugin';

<SidebarItem icon={CortexIcon} to="cortex" text="Cortex" />
```
