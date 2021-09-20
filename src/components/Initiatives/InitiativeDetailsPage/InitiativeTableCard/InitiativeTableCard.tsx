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
import { InfoCard } from '@backstage/core';
import React from 'react';
import { InitiativeActionItem } from '../../../../api/types';
import { useDetailCardStyles } from '../../../../styles/styles';
import { EmptyState } from '@backstage/core-components';
import { FailingComponentsTable } from './FailingComponentsTable';
import { PassingComponentsTable } from './PassingComponentsTable';

interface InitiativeTableProps {
  componentRefs: string[];
  numRules: number;
  actionItems: InitiativeActionItem[];
}

export const InitiativeTableCard = ({
  componentRefs,
  numRules,
  actionItems,
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
        numRules={numRules}
      />
      {passing.length > 0 && (
        <PassingComponentsTable componentRefs={passing} numRules={numRules} />
      )}
    </>
  );
};
