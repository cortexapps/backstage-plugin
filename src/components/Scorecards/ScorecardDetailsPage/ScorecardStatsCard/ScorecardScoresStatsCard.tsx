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
import { ScorecardServiceScore } from '../../../../api/types';
import { Paper } from '@material-ui/core';
import { isEmpty, mean, round } from 'lodash';
import { median, quantileSorted } from 'simple-statistics';
import Stats from '../../../Common/Stats';
import StatsItem from '../../../Common/StatsItem';

interface ScorecardScoresStatsCardProps {
  entityCategory: string;
  scores: ScorecardServiceScore[];
}

export const ScorecardScoresStatsCard = ({
  entityCategory,
  scores,
}: ScorecardScoresStatsCardProps) => {
  const type = 'PERCENTAGE';
  const percentages = useMemo(
    () => (isEmpty(scores) ? [0] : scores.map(score => score.scorePercentage)),
    [scores],
  );

  const avgScore = useMemo(() => round(mean(percentages), 2), [percentages]);
  const percentile = useMemo(
    () => quantileSorted([...percentages].reverse(), 0.8),
    [percentages],
  );
  const medianScore = useMemo(() => median(percentages), [percentages]);

  return (
    <Paper elevation={0} style={{ marginBottom: 8 }}>
      <Stats>
        <StatsItem
          caption={'Avg score'}
          percentage
          type={type}
          value={avgScore}
        />
        <StatsItem
          caption={'Median score'}
          percentage
          type={type}
          value={medianScore}
        />
        <StatsItem
          caption={'80th percentile'}
          percentage
          type={type}
          value={percentile}
        />
        <StatsItem
          caption={entityCategory}
          type={'NONE'}
          value={scores.length}
        />
      </Stats>
    </Paper>
  );
};
