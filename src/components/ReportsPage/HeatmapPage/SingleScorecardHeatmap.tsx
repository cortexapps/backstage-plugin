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
import { SingleScorecardHeatmapTable } from './Tables/SingleScorecardHeatmapTable';
import { StringIndexable, applyScoreFilters, catalogToRelationsByEntityId } from './HeatmapUtils';
import { HomepageEntityWithDomains } from '../../../api/userInsightTypes';
import { HeatmapPageFilters } from './HeatmapFilters';
import { ScorecardLadder } from '../../../api/types';

interface SingleScorecardHeatmapProps {
  entityCategory: string;
  entitiesByTag: StringIndexable<HomepageEntityWithDomains>;
  scorecardId: number;
  ladder: ScorecardLadder | undefined;
  filters: HeatmapPageFilters;
}

export const SingleScorecardHeatmap = ({
  entityCategory,
  entitiesByTag,
  scorecardId,
  ladder,
  filters: {
    groupBy,
    headerType,
    scoreFilters,
    useHierarchy,
    hideWithoutChildren,
  }
}: SingleScorecardHeatmapProps) => {
  const {
    value: scores,
    loading: loadingScores,
    error: scoresError,
  } = useCortexApi(api => api.getScorecardScores(scorecardId), [scorecardId]);

  const { domainTagByEntityId, ownerEmailByEntityId, groupTagByEntityId } = useMemo(() => {
    return catalogToRelationsByEntityId(entitiesByTag);
  }, [entitiesByTag]);

  const filteredScores = useMemo(() => {
    return applyScoreFilters(scores ?? [], scoreFilters, domainTagByEntityId, ownerEmailByEntityId, groupTagByEntityId);
  }, [scores, scoreFilters, domainTagByEntityId, ownerEmailByEntityId, groupTagByEntityId])

  if (loadingScores) {
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
      ladder={ladder}
      scores={filteredScores}
      useHierarchy={useHierarchy}
      hideWithoutChildren={hideWithoutChildren}
      domainTagByEntityId={domainTagByEntityId}
    />
  );
};
