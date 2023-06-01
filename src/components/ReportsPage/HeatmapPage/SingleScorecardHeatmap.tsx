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
import { Progress, WarningPanel } from '@backstage/core-components';
import { useCortexApi, useEntitiesByTag } from '../../../utils/hooks';
import { GroupByOption, HeaderType } from '../../../api/types';
import { SingleScorecardHeatmapTable } from './Tables/SingleScorecardHeatmapTable';

interface SingleScorecardHeatmapProps {
  scorecardId: number;
  groupBy: GroupByOption;
  headerType: HeaderType;
}

export const SingleScorecardHeatmap = ({
  scorecardId,
  groupBy,
  headerType,
}: SingleScorecardHeatmapProps) => {
  const {
    value: scores,
    loading: loadingScores,
    error: scoresError,
  } = useCortexApi(api => api.getScorecardScores(scorecardId), [scorecardId]);

  const { value: ladders, loading: loadingLadders } = useCortexApi(
    api => api.getScorecardLadders(scorecardId),
    [scorecardId],
  );
  const { entitiesByTag, loading: loadingEntities } = useEntitiesByTag();

  if (loadingScores || loadingLadders || loadingEntities) {
    return <Progress />;
  }

  if (scoresError || scores === undefined) {
    return (
      <WarningPanel severity="error" title="Could not load Scorecard scores.">
        {scoresError?.message}
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
      entitiesByTag={entitiesByTag}
      groupBy={groupBy}
      headerType={headerType}
      ladder={ladders?.[0]}
      scores={scores}
    />
  );
};
