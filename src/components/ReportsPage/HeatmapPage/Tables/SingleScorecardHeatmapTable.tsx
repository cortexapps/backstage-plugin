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
import { isUndefined } from 'lodash';
import { Progress, WarningPanel } from '@backstage/core-components';

import { HeatmapTableByGroup } from './HeatmapTableByGroup';
import { HeatmapTableByLevels } from './HeatmapTableByLevels';
import { HeatmapTableByService } from './HeatmapTableByService';
import { LevelsDrivenTable } from './LevelsDrivenTable';
import { getScorecardServiceScoresByGroupByOption, getSortedRuleNames, groupScoresByHierarchies, StringIndexable } from '../HeatmapUtils';
import { getSortedLadderLevelNames } from '../../../../utils/ScorecardLadderUtils';

import { GroupByOption, HeaderType, ScorecardLadder, ScorecardServiceScore } from '../../../../api/types';
import { HomepageEntity } from '../../../../api/userInsightTypes';
import { useCortexApi } from '../../../../utils/hooks';

interface SingleScorecardHeatmapTableProps {
  entityCategory: string;
  scorecardId: number;
  entitiesByTag: StringIndexable<HomepageEntity>;
  groupBy: GroupByOption;
  headerType: HeaderType;
  ladder: ScorecardLadder | undefined;
  scores: ScorecardServiceScore[];
  useHierarchy: boolean;
  hideWithoutChildren: boolean;
  domainTagByEntityId: Record<string, string[]>;
}

export const SingleScorecardHeatmapTable = ({
  entityCategory,
  scorecardId,
  entitiesByTag,
  groupBy,
  headerType,
  ladder,
  scores,
  useHierarchy,
  hideWithoutChildren,
  domainTagByEntityId,
}: SingleScorecardHeatmapTableProps) => {
  const levelsDriven = headerType === HeaderType.LEVELS;
  const headers = useMemo(
    () =>
      (!isUndefined(ladder) && levelsDriven
        ? getSortedLadderLevelNames(ladder)
        : scores[0] && getSortedRuleNames(scores[0])) ?? [],
    [levelsDriven, ladder, scores],
  );

  const { value: teamHierarchies, loading: loadingTeamHierarchies } = useCortexApi(api => api.getTeamHierarchies());
  const { value: domainHierarchies, loading: loadingDomainHierarchies } = useCortexApi(api => api.getDomainHierarchies());

  const data = useMemo(() => {
    const groupedData = getScorecardServiceScoresByGroupByOption(scores, groupBy, domainTagByEntityId);

    if (useHierarchy) {
      if (groupBy === GroupByOption.TEAM && teamHierarchies) {
        return groupScoresByHierarchies(groupedData, teamHierarchies.orderedParents);
      } else if (groupBy === GroupByOption.DOMAIN && domainHierarchies) {
        return groupScoresByHierarchies(groupedData, domainHierarchies.orderedTree);
      }
    }

    return groupedData;
  }, [scores, groupBy, useHierarchy, teamHierarchies, domainHierarchies, domainTagByEntityId]);

  if (useHierarchy && ((groupBy === GroupByOption.TEAM && loadingTeamHierarchies) || (groupBy === GroupByOption.DOMAIN && loadingDomainHierarchies))) {
    return <Progress />;
  }

  if (headerType === HeaderType.LEVELS) {
    if (isUndefined(ladder)) {
      return (
        <WarningPanel
          severity="error"
          title="Scorecard has no levels defined."
        />
      );
    } else {
      return (
        <LevelsDrivenTable
          data={data}
          entitiesByTag={entitiesByTag}
          groupBy={groupBy}
          levels={headers}
          entityCategory={entityCategory}
        />
      );
    }
  }

  switch (groupBy) {
    case GroupByOption.ENTITY:
      return (
        <HeatmapTableByService
          header={`${entityCategory} Details`}
          scorecardId={scorecardId}
          data={data}
          entitiesByTag={entitiesByTag}
          rules={headers}
        />
      );
    case GroupByOption.SERVICE_GROUP:
      return <HeatmapTableByGroup header="Group" rules={headers} data={data} entityCategory={entityCategory} />;
    case GroupByOption.TEAM:
      return <HeatmapTableByGroup header="Team" rules={headers} data={data} entityCategory={entityCategory} hideWithoutChildren={hideWithoutChildren} />;
    case GroupByOption.LEVEL:
      return (
        <HeatmapTableByLevels ladder={ladder} rules={headers} data={data} entityCategory={entityCategory} />
      );
    case GroupByOption.DOMAIN:
      return <HeatmapTableByGroup header="Domain" rules={headers} data={data} entityCategory={entityCategory} hideWithoutChildren={hideWithoutChildren} />;
  }
};
