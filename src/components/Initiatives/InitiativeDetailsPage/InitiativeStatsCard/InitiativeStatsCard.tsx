/*
 * Copyright 2022 Cortex Applications, Inc.
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
import { percentageToStatus, Status } from '../../../../styles/styles';
import { StatsCard } from '../../../StatsCard';
import { percentify } from '../../../../utils/numeric';
import { safeDivide } from "../../../../utils/NumberUtils";

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
        ?.map(score => score.componentRef)
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
        ?.map(score => score.componentRef)
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
    () => safeDivide(numPassing, (numPassing + numFailing)),
    [numPassing, numFailing],
  );

  return (
    <StatsCard
      stats={[
        {
          label: 'Complete',
          status: percentageToStatus(complete),
          value: percentify(complete),
          type: 'PERCENTAGE',
        },
        { label: 'Passing', status: Status.OKAY, value: numPassing },
        { label: 'Failing', status: Status.ERROR, value: numFailing },
      ]}
    />
  );
};
