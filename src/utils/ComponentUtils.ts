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

import { Entity } from '@backstage/catalog-model';
import { CustomMapping } from '@cortexapps/backstage-plugin-extensions';
import { merge } from 'lodash';
import { HomepageEntity } from '../api/userInsightTypes';

export type EntityRefContext = {
  defaultKind?: string;
  defaultNamespace?: string;
};

export const defaultComponentRefContext: EntityRefContext = {
  defaultKind: 'Component',
  defaultNamespace: 'default',
};

export const defaultGroupRefContext: EntityRefContext = {
  defaultKind: 'Group',
  defaultNamespace: 'default',
};

export const defaultSystemRefContext: EntityRefContext = {
  defaultKind: 'System',
  defaultNamespace: 'default',
};

export const applyCustomMappings = (
  entity: Entity,
  customMappings: CustomMapping[],
) => {
  return customMappings.reduce(
    (modifiedEntity: Entity, customMapping: CustomMapping) => {
      const partialEntity = {
        spec: customMapping(entity),
      };

      merge(modifiedEntity, partialEntity);

      return modifiedEntity;
    },
    entity,
  );
};

export const entityComponentRef = ({ definition }: HomepageEntity) => {
  return `${definition.kind}:${definition.namespace}/${definition.name}`;
};
