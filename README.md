# Cortex Scorecard Plugin for Backstage

[Cortex](https://www.cortex.io/) makes it easy for engineering organizations to gain
visibility into their services and deliver high quality software.

We’ve released our Scorecards product as a Backstage plugin. [Scorecards](https://www.cortex.io/products/scorecard)
allow your team to define standards like production readiness and development quality,
and enforce them without building scripts and maintaining spreadsheets.

- **One-click integration with third-party tools**: Scorecards fetch data automatically from your integrations without manual work, letting you easily enforce standards across all your tools.
- **The flexibility to meet your organization’s needs**: Our robust APIs make it easy to use data from custom sources in your Scorecards. Cortex Query Language (CQL) enables you to create complex rules that can compare data across multiple sources or write expressive logical statements.
- **Enable leaders to make informed decisions**: Historical data and organizational summaries give leadership deep visibility into progress, bottlenecks, and areas of risk.
- **Drive organizational progress with ease using Initiatives**: Within any Scorecard, assign owners and due dates to drive any best-practice, platform migration, and audit needs.

The plugin automatically ingests your Backstage components and then lets you easily define
standards and governance using our Scorecard editor. Scores are then piped back into Backstage
through our plugin, so you can see the results directly in your Backstage service catalog.
Developers never need to leave your Backstage portal to understand their action items and
how to improve the quality of their services.

Scorecards are extremely flexible, letting you track and enforce anything custom, including:

- Security standards
- Production readiness
- Service maturity
- Platform and package migrations
- [DORA metrics](https://www.cortex.io/post/building-a-dora-metrics-scorecard)

![plugin1](./docs/screen2.png?raw=true)
![plugin2](./docs/screen3.png?raw=true)

Cortex creates personalized action items for service owners. These can be found in the Backstage UI
or received through notifications via Slack and email.

To start using the Backstage plugin and see a demo, please [book a demo](https://www.cortex.io/demo)!

For information on how to migrate between major versions, see the [migration guide](https://github.com/cortexapps/backstage-plugin/blob/master/MIGRATION.md).

## Setup and Integration

1. In the [packages/app](https://github.com/backstage/backstage/blob/master/packages/app/) directory of your backstage
   instance, add the plugin as a package.json dependency:

```shell
$ yarn add @cortexapps/backstage-plugin
```

2. Export the plugin in your app's [plugins.ts](https://github.com/backstage/backstage/blob/master/packages/app/src/plugins.ts)
   to enable the plugin:

```ts
export { cortexPlugin } from '@cortexapps/backstage-plugin';
```

3. Import page to [App.tsx](https://github.com/backstage/backstage/blob/master/packages/app/src/App.tsx):

```tsx
import { CortexPage } from '@cortexapps/backstage-plugin';
```

3. And add a new route to [App.tsx](https://github.com/backstage/backstage/blob/master/packages/app/src/App.tsx):

```tsx
<Route path="/cortex" element={<CortexPage />} />
```

4. Update [app-config.yaml](https://github.com/backstage/backstage/blob/master/app-config.yaml#L54) to add a new config under
   the `proxy` section:

```yaml
'/cortex':
  target: ${CORTEX_BACKEND_HOST_URL}
  headers:
    Authorization: Bearer ${CORTEX_TOKEN}
  allowedHeaders: ['x-cortex-email', 'x-cortex-name']
```

5. Import `EntityCortexContent` and update [EntityPage.tsx](https://github.com/backstage/backstage/blob/master/packages/app/src/components/catalog/EntityPage.tsx) to add a new catalog tab for Cortex:

```tsx
import { EntityCortexContent } from '@cortexapps/backstage-plugin';

<EntityLayout.Route path="/cortex" title="Cortex">
  <EntityCortexContent />
</EntityLayout.Route>;
```

6. Add a new sidebar item in [Root.tsx](https://github.com/backstage/backstage/blob/master/packages/app/src/components/Root/Root.tsx)

```tsx
import { CortexIcon } from '@cortexapps/backstage-plugin';

<SidebarItem icon={CortexIcon} to="cortex" text="Cortex" />;
```

7. (Optional) Import `CortexScorecardWidget` and update [EntityPage.tsx](https://github.com/backstage/backstage/blob/master/packages/app/src/components/catalog/EntityPage.tsx) to add a new component widget for Cortex that shows scorecards for that component:

```tsx
import { CortexScorecardWidget } from '@cortexapps/backstage-plugin';

<Grid item md={4} xs={12}>
  <CortexScorecardWidget />
</Grid>;
```

8. (Optional) Import `CortexGroupActionItemsWidget` and update [EntityPage.tsx](https://github.com/backstage/backstage/blob/master/packages/app/src/components/catalog/EntityPage.tsx) to add a new group widget for Cortex that shows initiative action items for components owned by that group:

```tsx
import { CortexGroupActionItemsWidget } from '@cortexapps/backstage-plugin';

<Grid item md={4} xs={12}>
  <CortexGroupActionItemsWidget />
</Grid>;
```

9. (Optional) Import `SystemCortexContent` and update [EntityPage.tsx](https://github.com/backstage/backstage/blob/master/packages/app/src/components/catalog/EntityPage.tsx) to add a new catalog tab for Cortex:

```tsx
<EntityLayout.Route path="/cortex" title="Cortex">
  <SystemCortexContent />
</EntityLayout.Route>
```

10. (Optional) Update `app-config.yaml` to point to a self-hosted instance.

```yaml
cortex:
  frontendBaseUrl: ${CORTEX_FRONTEND_HOST_URL}
```

11. (Optional) Update `app-config.yaml` to hide the Settings page from all users, including admins.

```yaml
cortex:
  hideSettings: true
```

12. (Optional) When performing manual entity sync in the Settings page, you can choose to use gzip to compress the entities by updating `app-config.yaml` with the parameter `syncWithGzip`. You must also update the Backstage HTTP proxy to allow the `Content-Encoding` header.

```yaml
cortex:
  syncWithGzip: true
```

```yaml
proxy:
  '/cortex':
    target: ${CORTEX_BACKEND_HOST_URL}
    headers:
      Authorization: ${CORTEX_TOKEN}
    allowedHeaders:
      - Content-Encoding
```

13. (Optional) Customize the appearance of the Cortex plugin

Set custom Cortex page header:

```yaml
cortex:
  header:
    title: 'My custom title' # defaults to "Cortex"
    subtitle: '' # defaults to "Understand and improve your services."
```

Hide links targeting Cortex app:

```yaml
cortex:
  hideCortexLinks: true # defaults to `false`
```

Set custom name for Initiative(s):

```yaml
cortex:
  initiativeNameOverride:
    singular: 'enhancement target' # defaults to 'initiative'
    plural: 'enhancement targets' # defaults to 'initiatives'
```

14. (Optional) Customize Backstage homepage as the Cortex homepage:

![homepage](./docs/homepage.png?raw=true)

- Import `CortexHomepage` and update [App.tsx](https://github.com/backstage/backstage/blob/master/packages/app/src/App.tsx):

```tsx
import { CortexHomepage } from '@cortexapps/backstage-plugin';

<Route path="/" element={<HomepageCompositionRoot />}>
  <CortexHomepage />
</Route>;
```

- Update sidebar items in [Root.tsx](https://github.com/backstage/backstage/blob/master/packages/app/src/components/Root/Root.tsx):

```tsx
<SidebarItem icon={HomeIcon} to="/" text="Home" />
```

See [Backstage Homepage documentation](https://backstage.io/docs/getting-started/homepage) for further details.

Note: we rely on [Backstage's Identity API](https://backstage.io/docs/reference/core-plugin-api.identityapi/), specifically the `email` returned by `getProfileInfo()` for user-scoped requests.

## Advanced

You can configure the Cortex plugin to customize its layout as well as customize how entities from Backstage are synced into entities in Cortex.

### **`cortex.ts`**

```tsx
import {
  CustomMapping,
  EntityFilterGroup,
  extendableCortexPlugin,
  ExtensionApi,
} from '@cortexapps/backstage-plugin';
import { Entity } from '@backstage/catalog-model';

class ExtensionApiImpl implements ExtensionApi {
  async getAdditionalFilters(): Promise<EntityFilterGroup[]> {
    return [
      {
        name: 'Type',
        groupProperty: (entity: Entity) =>
          entity.spec?.type === null || entity.spec?.type === undefined
            ? undefined
            : [JSON.stringify(entity.spec?.type).replaceAll('"', '')],
      },
    ];
  }

  async getCustomMappings(): Promise<CustomMapping[]> {
    return [
      (entity: Entity) => {
        if (!componentEntityV1alpha1Validator.check(entity)) {
          return {};
        }

        const component = entity as ComponentEntityV1alpha1;
        const system = component.spec.system;
        const serviceGroup = system ? `system:${system}` : undefined;

        return {
          'x-cortex-service-groups': [
            ...(component.metadata.tags ?? []),
            ...(serviceGroup ?? []),
          ],
        };
      },
    ];
  }
}

export const { plugin, EntityCortexContent, CortexPage } =
  extendableCortexPlugin({}, () => new ExtensionApiImpl());
```

The extension above will insert Backstage spec types as a new filter type in many of the views -- and more filtering and aggregations with this configuration to follow.

Then, instead of importing/exporting from `@cortexapps/backstage-plugin` directly, you can use these new extended exports instead:

### **`packages/app/src/plugins.ts`**

```ts
export { plugin } from './cortex';
```

### **`packages/app/src/App.tsx`**

```tsx
import { CortexPage } from './cortex';
```

### **`packages/app/src/components/catalog/EntityPage.tsx`**

```tsx
import { EntityCortexContent } from '../../cortex';
```
