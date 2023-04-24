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
import { useCortexApi, useEntitiesByTag } from '../../../utils/hooks';
import { GroupByOption } from '../../../api/types';
import { AllScorecardsHeatmapTable } from '../HeatmapPage/Tables/AllScorecardHeatmapTable';

interface AllScorecardsHeatmapProps {
  groupBy: GroupByOption;
}

export const AllScorecardsHeatmap = ({
  groupBy,
}: AllScorecardsHeatmapProps) => {
  const {
    value: serviceScores,
    loading,
    error,
  } = useCortexApi(api => api.getServiceScorecardScores(groupBy), [groupBy]);

  const scorecards = useMemo(() => {
    const out: Record<string, string> = {};
    serviceScores
      ?.flatMap(score => score.scores)
      ?.forEach(score => {
        out[score.scorecardId] = score.scorecardName!!;
      });
    return out;
  }, [serviceScores]);

  const scorecardIds = useMemo(() => {
    return Object.keys(scorecards).sort((a, b) =>
      scorecards[a].localeCompare(scorecards[b]),
    );
  }, [scorecards]);

  const { entitiesByTag, loading: loadingEntities } = useEntitiesByTag();

  if (loading || loadingEntities) {
    return <Progress />;
  }

  if (error || serviceScores === undefined) {
    return (
      <WarningPanel severity="error" title="Could not load Scorecards.">
        {error?.message}
      </WarningPanel>
    );
  }

  if (groupBy === GroupByOption.LEVEL) {
    return (
      <WarningPanel severity="error" title="Functionality not supported.">
        Group by for levels is not supported yet.
      </WarningPanel>
    );
  }

  const scorecardNames = scorecardIds.map(
    scorecardId => scorecards[scorecardId],
  );

  return (
    <AllScorecardsHeatmapTable
      entitiesByTag={entitiesByTag}
      groupBy={groupBy}
      scorecardNames={scorecardNames}
      serviceScores={serviceScores}
    />
  );
};
