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
import { InitiativeActionItem } from '../../../../api/types';
import { useDetailCardStyles } from '../../../../styles/styles';
import { EmptyState, InfoCard } from '@backstage/core-components';
import { FailingComponentsTable } from './FailingComponentsTable';
import { PassingComponentsTable } from './PassingComponentsTable';
import { StringIndexable } from '../../../ReportsPage/HeatmapPage/HeatmapUtils';
import { HomepageEntity } from '../../../../api/userInsightTypes';

interface InitiativeTableProps {
  actionItems: InitiativeActionItem[];
  componentRefs: string[];
  entitiesByTag: StringIndexable<HomepageEntity>;
  numRules: number;
}

export const InitiativeTableCard = ({
  actionItems,
  componentRefs,
  entitiesByTag,
  numRules,
}: InitiativeTableProps) => {
  const classes = useDetailCardStyles();

  if (componentRefs.length === 0) {
    return (
      <InfoCard title="Action Items" className={classes.root}>
        <EmptyState missing="data" title="No components found." />
      </InfoCard>
    );
  }

  const filteredActionItems = actionItems.filter(actionItem =>
    componentRefs.some(
      componentRef => actionItem.componentRef === componentRef,
    ),
  );

  const passing = componentRefs.filter(componentRef =>
    actionItems.every(actionItem => actionItem.componentRef !== componentRef),
  );

  return (
    <>
      <FailingComponentsTable
        actionItems={filteredActionItems}
        entitiesByTag={entitiesByTag}
        numRules={numRules}
      />
      <PassingComponentsTable
        componentRefs={passing}
        entitiesByTag={entitiesByTag}
        numRules={numRules}
      />
    </>
  );
};
