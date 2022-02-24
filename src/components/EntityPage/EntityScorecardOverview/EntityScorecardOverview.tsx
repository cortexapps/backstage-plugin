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
import { Progress, WarningPanel } from '@backstage/core-components';
import { ServiceScorecardScore } from '../../../api/types';
import { useCortexApi } from '../../../utils/hooks';
import { quantileRankSorted } from 'simple-statistics';
import { StatsCard } from '../../StatsCard';
import { percentageToStatus } from '../../../styles/styles';

interface EntityScorecardDetailsProps {
  score?: ServiceScorecardScore;
}

export const EntityScorecardOverview = ({
  score,
}: EntityScorecardDetailsProps) => {
  const {
    value: allScores,
    loading,
    error,
  } = useCortexApi(
    async cortexApi => {
      return score !== undefined
        ? await cortexApi.getScorecardScores(score.scorecard.id)
        : undefined;
    },
    [score],
  );

  const sortedScores = useMemo(
    () =>
      allScores
        ?.map(currScore => currScore.scorePercentage)
        ?.sort((a, b) => a - b),
    [allScores],
  );

  if (loading || score === undefined || sortedScores === undefined) {
    return <Progress />;
  }

  if (error) {
    return (
      <WarningPanel severity="error" title="Failed to load scorecard.">
        {error.message}
      </WarningPanel>
    );
  }

  const rank =
    [...new Set(sortedScores)].reverse().indexOf(score.score.scorePercentage) +
    1;
  const percentileRank = quantileRankSorted(
    sortedScores,
    score.score.scorePercentage,
  );
  const numFailingRules = score.evaluation.rules.filter(
    rule => rule.score === 0,
  ).length;

  return (
    <StatsCard
      stats={[
        {
          label: 'Rank',
          status: percentageToStatus(percentileRank),
          value: rank,
          type: 'NTH',
        },
        {
          label: 'Percentile',
          status: percentageToStatus(percentileRank),
          value: percentileRank * 100,
          type: 'NTH',
          percentage: true,
        },
        {
          label: 'Failing Rules',
          status: percentageToStatus(
            1 - numFailingRules / score.evaluation.rules.length,
          ),
          value: numFailingRules,
        },
      ]}
    />
  );
};
