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
import React from 'react';
import { Progress, WarningPanel } from '@backstage/core-components';
import { useCortexApi } from '../../../utils/hooks';
import { GroupByOption } from '../../../api/types';
import { SingleScorecardHeatmapTable } from './Tables/SingleScorecardHeatmapTable';

interface SingleScorecardHeatmapProps {
  scorecardId: number;
  groupBy: GroupByOption;
}

export const SingleScorecardHeatmap = ({
  scorecardId,
  groupBy,
}: SingleScorecardHeatmapProps) => {
  const {
    value: scores,
    loading,
    error,
  } = useCortexApi(api => api.getScorecardScores(scorecardId), [scorecardId]);

  if (loading) {
    return <Progress />;
  }

  if (error || scores === undefined) {
    return (
      <WarningPanel severity="error" title="Could not load scorecard.">
        {error?.message}
      </WarningPanel>
    );
  }

  if (scores.length === 0) {
    return (
      <WarningPanel
        severity="error"
        title="Scorecard has not been evaluated."
      />
    );
  }

  return (
    <SingleScorecardHeatmapTable
      scorecardId={scorecardId}
      groupBy={groupBy}
      scores={scores}
    />
  );
};
