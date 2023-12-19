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
import { TableColumn } from '@backstage/core-components';
import { ScorecardScoreLadderLevel } from '../../../../api/types';
import { ScorecardLadderLevelBadge } from '../../../Common/ScorecardLadderLevelBadge';
import React from 'react';
import { LinearProgressWithLabel } from '../../../Common/LinearProgressWithLabel';
import { percentify } from '../../../../utils/NumberUtils';

export const PAGE_SIZE = 25;

export const levelSort = (
  data1: { level?: ScorecardScoreLadderLevel },
  data2: { level?: ScorecardScoreLadderLevel },
) => {
  const level1 = data1?.level?.rank ?? -1;
  const level2 = data2?.level?.rank ?? -1;

  return level2 - level1;
};

export const scorePercentageSort = (
  data1: { scorePercentage?: number },
  data2: { scorePercentage?: number },
) => {
  const score1 = data1?.scorePercentage ?? 0;
  const score2 = data2?.scorePercentage ?? 0;

  return score2 - score1;
};

export const levelColumn: TableColumn = {
  field: 'level',
  title: 'Level',
  width: '20%',
  customSort: levelSort,
  render: ({ level }: { level?: ScorecardScoreLadderLevel }) =>
    level ? (
      <ScorecardLadderLevelBadge
        showName
        name={level.name}
        color={level.color}
      />
    ) : null,
};

export const scoreColumn: TableColumn = {
  field: 'scorePercentage',
  sorting: true,
  title: 'Score',
  width: '10%',
  render: (data: { scorePercentage?: number }) => {
    return (
      <LinearProgressWithLabel value={percentify(data?.scorePercentage ?? 0)} />
    );
  },
  customSort: scorePercentageSort,
};
