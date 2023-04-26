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
import React from 'react';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { defaultComponentRefContext } from '../../utils/ComponentUtils';
import { Entity, CompoundEntityRef } from '@backstage/catalog-model';

interface DefaultEntityRefLinkProps {
  children?: React.ReactNode;
  entityRef: Entity | CompoundEntityRef;
  title?: string;
}

export const DefaultEntityRefLink = ({
  children,
  entityRef,
  title,
}: DefaultEntityRefLinkProps) => {
  return (
    <EntityRefLink
      /* eslint-disable-next-line react/no-children-prop */
      children={children}
      defaultKind={defaultComponentRefContext.defaultKind}
      entityRef={entityRef}
      title={title}
    />
  );
};
