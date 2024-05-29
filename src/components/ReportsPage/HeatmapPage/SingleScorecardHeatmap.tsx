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
import React, { useMemo } from 'react';
import { Progress, WarningPanel } from '@backstage/core-components';
import { useCortexApi } from '../../../utils/hooks';
import { GroupByOption, HeaderType } from '../../../api/types';
import { SingleScorecardHeatmapTable } from './Tables/SingleScorecardHeatmapTable';
import { StringIndexable } from './HeatmapUtils';
import { HomepageEntity } from '../../../api/userInsightTypes';
import { ScoreFilters } from './HeatmapFiltersModal';
import { intersection } from 'lodash';

interface SingleScorecardHeatmapProps {
  entityCategory: string;
  entitiesByTag: StringIndexable<HomepageEntity>;
  scorecardId: number;
  groupBy: GroupByOption;
  headerType: HeaderType;
  scoreFilters: ScoreFilters;
}

export const SingleScorecardHeatmap = ({
  entityCategory,
  entitiesByTag,
  scorecardId,
  groupBy,
  headerType,
  scoreFilters,
}: SingleScorecardHeatmapProps) => {
  const {
    value: scores,
    loading: loadingScores,
    error: scoresError,
  } = useCortexApi(api => api.getScorecardScores(scorecardId), [scorecardId]);

  const filteredScores = useMemo(() => {
    if (!scores?.length) {
      return [];
    }

    let resultScores = scores;

    if (scoreFilters.serviceIds.length) {
      resultScores = resultScores.filter((score) => scoreFilters.serviceIds.includes(score.serviceId));
    }
    if (scoreFilters.groups.length) {
      resultScores = resultScores.filter((score) => intersection(scoreFilters.groups, score.tags).length);
    }

    return resultScores;
  }, [scores, scoreFilters])

  const { value: ladders, loading: loadingLadders } = useCortexApi(
    api => api.getScorecardLadders(scorecardId),
    [scorecardId],
  );

  if (loadingScores || loadingLadders) {
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
      entityCategory={entityCategory}
      scorecardId={scorecardId}
      entitiesByTag={entitiesByTag}
      groupBy={groupBy}
      headerType={headerType}
      ladder={ladders?.[0]}
      scores={filteredScores}
    />
  );
};
