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
import { createRouteRef, createSubRouteRef } from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'cortex',
});

export const scorecardsRouteRef = createSubRouteRef({
  id: 'scorecards',
  parent: rootRouteRef,
  path: '/scorecards',
});

export const scorecardRouteRef = createSubRouteRef({
  id: 'scorecard',
  path: '/scorecards/:id',
  parent: rootRouteRef,
});

export const scorecardServiceDetailsRouteRef = createSubRouteRef({
  id: 'scorecardServiceDetails',
  path: '/scorecards/:scorecardId/:namespace/:kind/:name',
  parent: rootRouteRef,
});

export const initiativeRouteRef = createSubRouteRef({
  id: 'initiative',
  path: '/initiatives/:id',
  parent: rootRouteRef,
});
