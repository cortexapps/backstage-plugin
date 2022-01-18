/*
 * Copyright 2021 Cortex Applications, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
  BackstagePlugin,
  createApiFactory,
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  TypesToApiRefs,
} from '@backstage/core-plugin-api';

import { rootRouteRef, scorecardRouteRef, scorecardsRouteRef } from './routes';
import { cortexApiRef, CortexClient } from './api';
import { ExtensionApi } from '@cortexapps/backstage-plugin-extensions';
import { NoopExtensionClient } from './api/NoopExtensionClient';
import { extensionApiRef } from './api/ExtensionApi';

export const cortexPlugin = createPlugin({
  id: 'cortex',
  apis: [
    createApiFactory({
      api: cortexApiRef,
      deps: { discoveryApi: discoveryApiRef },
      factory: ({ discoveryApi }) => new CortexClient({ discoveryApi }),
    }),
    createApiFactory({
      api: extensionApiRef,
      deps: {},
      factory: () => new NoopExtensionClient(),
    }),
  ],
  routes: {
    root: rootRouteRef,
    scorecards: scorecardsRouteRef,
    scorecard: scorecardRouteRef,
  },
});

export const extendableCortexPlugin = <
  Deps extends { [name in string]: unknown },
>(
  deps: TypesToApiRefs<Deps>,
  factory: (deps: Deps) => ExtensionApi = () => new NoopExtensionClient(),
) => {
  const plugin: BackstagePlugin = createPlugin({
    id: 'cortex',
    apis: [
      createApiFactory({
        api: cortexApiRef,
        deps: { discoveryApi: discoveryApiRef },
        factory: ({ discoveryApi }) => new CortexClient({ discoveryApi }),
      }),
      createApiFactory({
        api: extensionApiRef,
        deps: deps,
        factory: factory,
      }),
    ],
    routes: {
      root: rootRouteRef,
      scorecards: scorecardsRouteRef,
      scorecard: scorecardRouteRef,
    },
  });

  const CortexPage = plugin.provide(
    createRoutableExtension({
      name: "CortexPage",
      component: () =>
        import('./components/CortexPage').then(m => m.CortexPage),
      mountPoint: rootRouteRef,
    }),
  );

  const EntityCortexContent = plugin.provide(
    createComponentExtension({
      name: "EntityCortexContent",
      component: {
        lazy: () => import('./components/EntityPage').then(m => m.EntityPage),
      },
    }),
  );

  return { plugin, CortexPage, EntityCortexContent };
};

export const CortexPage = cortexPlugin.provide(
  createRoutableExtension({
    name: "CortexPage",
    component: () => import('./components/CortexPage').then(m => m.CortexPage),
    mountPoint: rootRouteRef,
  }),
);

export const EntityCortexContent = cortexPlugin.provide(
  createComponentExtension({
    name: "EntityCortexContent",
    component: {
      lazy: () => import('./components/EntityPage').then(m => m.EntityPage),
    },
  }),
);
