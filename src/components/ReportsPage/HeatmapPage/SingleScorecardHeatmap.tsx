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
import { HomepageEntity } from '../../../api/userInsightTypes';
import { HeatmapPageFilters } from './HeatmapFilters';
import { ScorecardLadder } from '../../../api/types';
import { keyBy } from 'lodash';

interface SingleScorecardHeatmapProps {
  entityCategory: string;
  entitiesByTag: StringIndexable<HomepageEntity>;
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

  const { ownerEmailByEntityId, groupTagByEntityId } = useMemo(() => {
    return catalogToRelationsByEntityId(entitiesByTag);
  }, [entitiesByTag]);

  const { value: domainIdByEntityId, error: domainByEntityError, loading: isLoadingDomainByEntity } = useCortexApi(api => api.getEntityDomainAncestors());
  const domainTagByEntityId = useMemo(() => {
    if (!domainIdByEntityId) {
      return {};
    }

    const map = {} as Record<string, string[]>;
    const domainsById = keyBy(Object.values(entitiesByTag).filter((entity) => entity.type === "domain"), "id");

    Object.keys(domainIdByEntityId.entitiesToAncestors).forEach((entityId) => {
      map[entityId] = domainIdByEntityId.entitiesToAncestors[parseInt(entityId, 10)].map(
        (parentId) => domainsById[parentId].codeTag
      )
    });

    return map;
  }, [entitiesByTag, domainIdByEntityId]);

  const filteredScores = useMemo(() => {
    if (!domainIdByEntityId) {
      return [];
    }

    return applyScoreFilters(scores ?? [], scoreFilters, ownerEmailByEntityId, groupTagByEntityId, domainIdByEntityId.entitiesToAncestors);
  }, [scores, scoreFilters, ownerEmailByEntityId, groupTagByEntityId, domainIdByEntityId]);

  if (loadingScores || isLoadingDomainByEntity) {
    return <Progress />;
  }

  if (scoresError || scores === undefined) {
    return (
      <WarningPanel severity="error" title="Could not load Scorecard scores.">
        {scoresError?.message}
      </WarningPanel>
    );
  }

  if (!domainIdByEntityId || domainByEntityError) {
    return (
      <WarningPanel severity="error" title="Could not load Domain hierarchies.">
        {domainByEntityError?.message}
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
