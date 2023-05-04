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
import { HelpPageLink } from '@cortexapps/backstage-plugin-extensions';
import {
  Content,
  ContentHeader,
  EmptyState,
  ItemCardGrid,
} from '@backstage/core-components';
import React from 'react';
import { isEmpty } from 'lodash';
import { ListCard } from '../ListCard';

export interface HelpLinksContentProps {
  links: HelpPageLink[];
}

export const HelpLinksContent = ({ links }: HelpLinksContentProps) => {
  return (
    <Content>
      <ContentHeader title="Links" />
      {isEmpty(links) && <EmptyState title="No links found" missing="data" />}
      <ItemCardGrid>
        {links.map((link, index) => (
          <ListCard
            key={index}
            name={link.name}
            description={link.description}
            url={link.url}
          />
        ))}
      </ItemCardGrid>
    </Content>
  );
};
