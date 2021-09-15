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
import { Initiative, InitiativeActionItem } from '../../../../api/types';
import { useDetailCardStyles } from '../../../../styles/styles';
import { Button } from '@material-ui/core';
import { EmptyState } from '@backstage/core-components';
import { FailingComponentsTable } from './FailingComponentsTable';
import { PassingComponentsTable } from './PassingComponentsTable';

interface InitiativeTableProps {
  initiative: Initiative;
  actionItems: InitiativeActionItem[];
}

export const InitiativeTableCard = ({
  initiative,
  actionItems,
}: InitiativeTableProps) => {
  const classes = useDetailCardStyles();

  if (initiative.scores.length === 0) {
    return (
      <InfoCard title="Action Items" className={classes.root}>
        <EmptyState
          missing="data"
          title="Underlying scorecard has not been evaluated yet."
          description="Wait until next scorecard evaluation, or manually trigger from within Cortex."
          action={
            <Button
              variant="contained"
              color="primary"
              href={`https://app.getcortexapp.com/admin/scorecards/${initiative.scorecard.id}`}
            >
              Go to Cortex
            </Button>
          }
        />
      </InfoCard>
    );
  }

  const passing = initiative.scores
    .filter(score => score.scorePercentage === 1)
    .map(score => score.componentRef);

  return (
    <>
      <FailingComponentsTable
        actionItems={actionItems}
        numRules={initiative.emphasizedRules.length}
      />
      {passing.length > 0 && (
        <PassingComponentsTable
          componentRefs={passing}
          numRules={initiative.emphasizedRules.length}
        />
      )}
    </>
  );
};
