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
import React, { Dispatch, useMemo } from 'react';
import { isEmpty, isUndefined, keyBy, last } from 'lodash';
import { Progress, WarningPanel } from '@backstage/core-components';

import { HeatmapTableByGroup } from './HeatmapTableByGroup';
import { HeatmapTableByLevels } from './HeatmapTableByLevels';
import { HeatmapTableByService } from './HeatmapTableByService';
import { LevelsDrivenTable } from './LevelsDrivenTable';
import {
  findHierarchyItem,
  getAllHierarchyNodesFromTree,
  getScorecardServiceScoresByGroupByOption,
  getSortedRuleNames,
  groupScoresByHierarchies,
  HierarchyNode,
  StringIndexable,
} from '../HeatmapUtils';
import { getSortedLadderLevelNames } from '../../../../utils/ScorecardLadderUtils';

import {
  GroupByOption,
  HeaderType,
  ScorecardLadder,
  ScorecardServiceScore,
} from '../../../../api/types';
import { HomepageEntity } from '../../../../api/userInsightTypes';
import { useCortexApi } from '../../../../utils/hooks';
import { HeatmapPageFilters, SortBy } from '../HeatmapFilters';
import { defaultFilters as defaultScoreFilters } from '../HeatmapFiltersModal';

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
  setFiltersAndNavigate: Dispatch<React.SetStateAction<HeatmapPageFilters>>;
  filters: HeatmapPageFilters;
  sortBy?: SortBy;
  setSortBy: Dispatch<React.SetStateAction<SortBy | undefined>>;
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
  setFiltersAndNavigate,
  filters,
  sortBy,
  setSortBy,
}: SingleScorecardHeatmapTableProps) => {
  const levelsDriven = headerType === HeaderType.LEVELS;
  const headers = useMemo(
    () =>
      (!isUndefined(ladder) && levelsDriven
        ? getSortedLadderLevelNames(ladder, true)
        : scores[0] && getSortedRuleNames(scores[0])) ?? [],
    [levelsDriven, ladder, scores],
  );

  const { value: teamHierarchies, loading: loadingTeamHierarchies } =
    useCortexApi(api => api.getTeamHierarchies());
  const { value: domainHierarchies, loading: loadingDomainHierarchies } =
    useCortexApi(api => api.getDomainHierarchies());

  const lastPathItem = last(filters.path);

  const { flatDomains, flatTeams } = useMemo(() => {
    let flatDomains = undefined;
    let flatTeams = undefined;
    if (domainHierarchies && useHierarchy && groupBy === GroupByOption.DOMAIN) {
      flatDomains = keyBy(
        getAllHierarchyNodesFromTree(domainHierarchies?.orderedTree),
        'node.tag',
      );
    }

    if (teamHierarchies && useHierarchy && groupBy === GroupByOption.TEAM) {
      flatTeams = keyBy(
        getAllHierarchyNodesFromTree(teamHierarchies.orderedParents),
        'node.tag',
      );
    }

    return {
      flatDomains,
      flatTeams,
    };
  }, [teamHierarchies, domainHierarchies, groupBy, useHierarchy]);

  const data = useMemo(() => {
    const groupedData = getScorecardServiceScoresByGroupByOption(
      scores,
      groupBy,
      domainTagByEntityId,
    );

    if (useHierarchy) {
      let items = undefined;

      if (groupBy === GroupByOption.TEAM && teamHierarchies) {
        items = teamHierarchies.orderedParents as HierarchyNode[];
      } else if (groupBy === GroupByOption.DOMAIN && domainHierarchies) {
        items = domainHierarchies.orderedTree as HierarchyNode[];
      }

      if (items) {
        if (lastPathItem) {
          const foundHierarchyItem = findHierarchyItem(items, lastPathItem);

          if (foundHierarchyItem) {
            items = foundHierarchyItem.orderedChildren;
          }
        }

        return groupScoresByHierarchies(groupedData, items, lastPathItem);
      }
    }

    return groupedData;
  }, [
    scores,
    groupBy,
    useHierarchy,
    teamHierarchies,
    domainHierarchies,
    domainTagByEntityId,
    lastPathItem,
  ]);

  if (
    useHierarchy &&
    ((groupBy === GroupByOption.TEAM && loadingTeamHierarchies) ||
      (groupBy === GroupByOption.DOMAIN && loadingDomainHierarchies))
  ) {
    return <Progress />;
  }

  const onSelect = (identifier: string) => {
    if (!useHierarchy) return;

    const hierarchyItem =
      groupBy === GroupByOption.DOMAIN
        ? flatDomains?.[identifier]
        : flatTeams?.[identifier];

    if (!hierarchyItem) return;

    // If an empty item is clicked we have no more navigation to do
    // So we should apply our filters and navigate to the entity view
    if (
      isEmpty(hierarchyItem?.orderedChildren) ||
      identifier === lastPathItem
    ) {
      const selectedFilter =
        groupBy === GroupByOption.DOMAIN
          ? {
              domainIds: [entitiesByTag[hierarchyItem.node.tag].id],
            }
          : {
              teams: [hierarchyItem.node.tag],
            };
      setFiltersAndNavigate(prev => {
        return {
          ...prev,
          groupBy: GroupByOption.ENTITY,
          scoreFilters: {
            ...prev.scoreFilters,
            // reset conflicting filters
            teams: [],
            domainIds: [],
            ...selectedFilter,
          },
        };
      });
      return;
    }

    setFiltersAndNavigate(prev => {
      const nextPath = [...(prev.path ?? []), identifier];
      return {
        ...prev,
        path: nextPath,
      };
    });
  };

  const onDisplayColumnClick = (identifier: string) => {
    let scoreFilters: Partial<HeatmapPageFilters['scoreFilters']> = {};

    if (groupBy === GroupByOption.LEVEL) {
      scoreFilters = {
        levels: [identifier],
      };
    } else if (groupBy === GroupByOption.TEAM) {
      scoreFilters = {
        teams: [identifier],
      };
    } else if (groupBy === GroupByOption.DOMAIN) {
      const domain = Object.entries(domainTagByEntityId).find(([_id, tags]) => {
        return tags.includes(identifier);
      });
      if (!domain) return;
      scoreFilters = {
        domainIds: [Number(domain[0])],
      };
    } else if (groupBy === GroupByOption.SERVICE_GROUP) {
      scoreFilters = {
        groups: [identifier],
      };
    }

    setFiltersAndNavigate(prev => {
      return {
        ...prev,
        groupBy: GroupByOption.ENTITY,
        scoreFilters: {
          ...defaultScoreFilters,
          ...scoreFilters,
        },
      };
    });
  };
  if (headerType === HeaderType.LEVELS) {
    if (isUndefined(ladder)) {
      return (
        <WarningPanel
          severity="error"
          title="Scorecard has no levels defined."
        />
      );
    } else {
      const levelsHeader =
        groupBy === GroupByOption.SERVICE_GROUP ? 'Group' : groupBy;
      return (
        <LevelsDrivenTable
          data={data}
          entitiesByTag={entitiesByTag}
          groupBy={groupBy}
          header={levelsHeader}
          levels={headers}
          entityCategory={entityCategory}
          onSelect={useHierarchy ? onSelect : onDisplayColumnClick}
          useHierarchy={useHierarchy}
          hideWithoutChildren={hideWithoutChildren}
          lastPathItem={lastPathItem}
          sortBy={sortBy}
          setSortBy={setSortBy}
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
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
      );
    case GroupByOption.SERVICE_GROUP:
      return (
        <HeatmapTableByGroup
          header="Group"
          rules={headers}
          data={data}
          entityCategory={entityCategory}
          onSelect={useHierarchy ? onSelect : onDisplayColumnClick}
          useHierarchy={useHierarchy}
          sortBy={sortBy}
          setSortBy={setSortBy}
          entitiesByTag={entitiesByTag}
        />
      );
    case GroupByOption.TEAM:
      return (
        <HeatmapTableByGroup
          header="Team"
          rules={headers}
          data={data}
          entityCategory={entityCategory}
          hideWithoutChildren={hideWithoutChildren}
          onSelect={useHierarchy ? onSelect : onDisplayColumnClick}
          useHierarchy={useHierarchy}
          lastPathItem={lastPathItem}
          sortBy={sortBy}
          setSortBy={setSortBy}
          entitiesByTag={entitiesByTag}
        />
      );
    case GroupByOption.LEVEL:
      return (
        <HeatmapTableByLevels
          ladder={ladder}
          rules={headers}
          data={data}
          onSelect={onDisplayColumnClick}
          entityCategory={entityCategory}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
      );
    case GroupByOption.DOMAIN:
      return (
        <HeatmapTableByGroup
          header="Domain"
          rules={headers}
          data={data}
          entityCategory={entityCategory}
          hideWithoutChildren={hideWithoutChildren}
          onSelect={useHierarchy ? onSelect : onDisplayColumnClick}
          useHierarchy={useHierarchy}
          lastPathItem={lastPathItem}
          sortBy={sortBy}
          setSortBy={setSortBy}
          entitiesByTag={entitiesByTag}
        />
      );
  }
};
