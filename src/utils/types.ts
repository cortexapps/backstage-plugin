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
  CompoundEntityRef,
  Entity,
  parseEntityRef,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import { defaultComponentRefContext, EntityRefContext } from './ComponentUtils';

export const identity = <T>(t: T) => t;

export function assertUnreachable(_x: never): never {
  throw new Error("Didn't expect to get here");
}

export type Predicate<T> = (item: T) => boolean;

export function combinePredicates<T>(predicates: Predicate<T>[]): Predicate<T> {
  return (t: T) => {
    return predicates
      .map((filter: Predicate<T>) => filter?.(t) ?? true)
      .every(Boolean);
  };
}

export function enumKeys<
  ENUM extends object,
  K extends keyof ENUM = keyof ENUM,
>(obj: ENUM): K[] {
  return Object.keys(obj).filter(k => Number.isNaN(+k)) as K[];
}

export function stringifyAnyEntityRef(
  entityRef: AnyEntityRef,
  entityRefContext: EntityRefContext = defaultComponentRefContext,
): string {
  if (typeof entityRef === 'string') {
    return stringifyEntityRef(parseEntityRef(entityRef, entityRefContext));
  } else if (
    (entityRef as CompoundEntityRef).namespace !== undefined &&
    (entityRef as CompoundEntityRef).kind !== undefined
  ) {
    return stringifyEntityRef(entityRef as CompoundEntityRef);
  } else if ((entityRef as Entity).apiVersion !== undefined) {
    return stringifyEntityRef(entityRef as Entity);
  }

  return stringifyEntityRef(
    parseEntityRef(entityRef as PartialEntityName, entityRefContext),
  );
}

export function humanizeAnyEntityRef(
  entityRef: AnyEntityRef,
  entityRefContext: EntityRefContext = defaultComponentRefContext,
): string {
  let minifiedRef = stringifyAnyEntityRef(entityRef, entityRefContext);

  if (entityRefContext.defaultKind !== undefined) {
    const kind = entityRefContext.defaultKind.toLowerCase();
    minifiedRef = minifiedRef.replace(`${kind}:`, '');
  }

  if (entityRefContext.defaultNamespace !== undefined) {
    const namespace = entityRefContext.defaultNamespace.toLowerCase();
    minifiedRef = minifiedRef.replace(`${namespace}/`, '');
  }

  return minifiedRef;
}

export function entityEquals(
  a: AnyEntityRef,
  b: AnyEntityRef,
  entityRefContext: EntityRefContext = defaultComponentRefContext,
): boolean {
  const parsedA = stringifyAnyEntityRef(a, entityRefContext);
  const parsedB = stringifyAnyEntityRef(b, entityRefContext);
  return parsedA === parsedB;
}

export type PartialEntityName = {
  kind?: string;
  namespace?: string;
  name: string;
};

export type AnyEntityRef =
  | string
  | PartialEntityName
  | CompoundEntityRef
  | Entity;
