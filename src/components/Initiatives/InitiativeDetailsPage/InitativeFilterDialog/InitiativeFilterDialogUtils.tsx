/*
 * Copyright 2023 Cortex Applications, Inc.
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
  RELATION_OWNED_BY,
  parseEntityRef,
  RELATION_PART_OF,
} from '@backstage/catalog-model';
import {
  getEntityRelations,
  humanizeEntityRef,
} from '@backstage/plugin-catalog-react';
import { EntityFilterGroup } from '@cortexapps/backstage-plugin-extensions';
import {
  defaultGroupRefContext,
  defaultSystemRefContext,
} from '../../../../utils/ComponentUtils';
import { Predicate, stringifyAnyEntityRef } from '../../../../utils/types';

export type InitiativeFilter = Predicate<string>;

export const groupAndSystemFilters: EntityFilterGroup[] = [
  {
    name: 'Groups',
    groupProperty: entity =>
      getEntityRelations(entity, RELATION_OWNED_BY, {
        kind: 'group',
      }).map(entityRef =>
        stringifyAnyEntityRef(entityRef, { defaultKind: 'group' }),
      ),
    formatProperty: (groupRef: string) =>
      humanizeEntityRef(parseEntityRef(groupRef), defaultGroupRefContext),
  },
  {
    name: 'Systems',
    groupProperty: entity =>
      getEntityRelations(entity, RELATION_PART_OF, {
        kind: 'system',
      }).map(entityRef =>
        stringifyAnyEntityRef(entityRef, { defaultKind: 'system' }),
      ),
    formatProperty: (groupRef: string) =>
      humanizeEntityRef(parseEntityRef(groupRef), defaultSystemRefContext),
  },
];

export const toPredicateFilters = (
  filters: { [id: string]: boolean },
  name: string,
) => {
  return Object.keys(filters)
    .filter(key => key.includes(name))
    .reduce<Record<string, boolean>>((acc, key) => {
      const newKey = key.replace(name, '');
      acc[newKey] = filters[key];
      return acc;
    }, {});
};
