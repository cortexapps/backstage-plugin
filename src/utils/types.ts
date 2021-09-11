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
// @ts-ignore
import {
  Entity,
  EntityName,
  EntityRef,
  parseEntityName,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import { defaultEntityRefContext } from './ComponentUtils';

export function assertUnreachable(_x: never): never {
  throw new Error("Didn't expect to get here");
}

export function enumKeys<
  ENUM extends object,
  K extends keyof ENUM = keyof ENUM,
>(obj: ENUM): K[] {
  return Object.keys(obj).filter(k => Number.isNaN(+k)) as K[];
}

export function stringifyAnyEntityRef(entityRef: AnyEntityRef): string {
  if (typeof entityRef === 'string') {
    return entityRef;
  } else if (
    (entityRef as EntityName).namespace !== undefined &&
    (entityRef as EntityName).kind !== undefined
  ) {
    return stringifyEntityRef(entityRef as EntityName);
  } else if ((entityRef as Entity).apiVersion !== undefined) {
    return stringifyEntityRef(entityRef as Entity);
  }

  return stringifyEntityRef(
    parseEntityName(entityRef as PartialEntityName, defaultEntityRefContext),
  );
}

// Backstage seems to be inconsistent on typing... namespace/kind optional in some places, non-optional in others?
export type PartialEntityName = {
  kind?: string;
  namespace?: string;
  name: string;
};

export type AnyEntityRef = string | PartialEntityName | EntityName | Entity;
