/*
 * Copyright 2024 Cortex Applications, Inc.
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
import React, { useMemo } from 'react';
import {
  InitiativeActionItem,
  InitiativeServiceScores,
} from '../../../../api/types';
import { Predicate } from '../../../../utils/types';
import { safeDivide } from '../../../../utils/NumberUtils';
import { Paper } from '@material-ui/core';
import Stats from '../../../Common/Stats';
import StatsItem from '../../../Common/StatsItem';

export interface InitiativeStatsCardProps {
  scores: InitiativeServiceScores[];
  actionItems: InitiativeActionItem[];
  filter: () => Predicate<string>;
}

export const InitiativeStatsCard = ({
  scores,
  actionItems,
  filter,
}: InitiativeStatsCardProps) => {
  const numFailing = useMemo(() => {
    return (
      scores
        ?.map(score => score.entityTag)
        ?.filter(filter)
        ?.filter(componentRef =>
          actionItems?.some(
            actionItem => actionItem.componentRef === componentRef,
          ),
        )?.length ?? 0
    );
  }, [scores, filter, actionItems]);

  const numPassing = useMemo(() => {
    return (
      scores
        ?.map(score => score.entityTag)
        ?.filter(filter)
        ?.filter(
          componentRef =>
            !actionItems?.some(
              actionItem => actionItem.componentRef === componentRef,
            ),
        )?.length ?? 0
    );
  }, [scores, filter, actionItems]);

  const complete = useMemo(
    () => safeDivide(numPassing, numPassing + numFailing),
    [numPassing, numFailing],
  );

  return (
    <Paper elevation={0} style={{ marginBottom: 8 }}>
      <Stats>
        <StatsItem
          caption={'Complete'}
          percentage
          type={'PERCENTAGE'}
          value={complete}
        />
        <StatsItem caption={'Passing'} type={'NONE'} value={numPassing} />
        <StatsItem caption={'Failing'} type={'NONE'} value={numFailing} />
      </Stats>
    </Paper>
  );
};
