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
import { EntityRef, parseEntityName } from '@backstage/catalog-model';

export const defaultEntityRefContext = {
  defaultKind: 'Component',
  defaultNamespace: 'default',
};

export const compareRefs = (a: EntityRef, b: EntityRef) => {
  const nameA = parseEntityName(a, defaultEntityRefContext);
  const nameB = parseEntityName(b, defaultEntityRefContext);
  return (
    nameA.name === nameB.name &&
    nameA.namespace === nameB.namespace &&
    nameA.kind === nameB.kind
  );
};
