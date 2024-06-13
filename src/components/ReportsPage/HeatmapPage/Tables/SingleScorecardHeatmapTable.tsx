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
import { flatten, isEmpty, isNil, isUndefined, keyBy, last } from 'lodash';
import { Progress, WarningPanel } from '@backstage/core-components';

import { HeatmapTableByGroup } from './HeatmapTableByGroup';
import { HeatmapTableByLevels } from './HeatmapTableByLevels';
import { HeatmapTableByService } from './HeatmapTableByService';
import { LevelsDrivenTable } from './LevelsDrivenTable';
import {
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
import { HeatmapPageFilters } from '../HeatmapFilters';

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
}

const findItem = (
  nodes: HierarchyNode[],
  lastItemIdentifier: string,
): HierarchyNode | undefined => {
  let item = nodes.find((item: HierarchyNode) => {
    return item.node.tag === lastItemIdentifier;
  });

  if (!item) {
    for (const nodeItem of nodes) {
      const childItem = findItem(nodeItem.orderedChildren, lastItemIdentifier);
      if (childItem) {
        item = childItem;
        break;
      }
    }
  }

  return item;
};

const getAllDescendants = (treeNode: HierarchyNode): HierarchyNode[] => {
  const children = flatten(
    treeNode.orderedChildren.map(childNode => getAllDescendants(childNode)),
  );

  return [treeNode, ...children];
};

export const getAllNodesFromTree = (
  nodes?: HierarchyNode[],
): HierarchyNode[] => {
  if (isNil(nodes) || isEmpty(nodes)) {
    return [];
  }

  return flatten(nodes.map(domainNode => getAllDescendants(domainNode)));
};

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
}: SingleScorecardHeatmapTableProps) => {
  const levelsDriven = headerType === HeaderType.LEVELS;
  const headers = useMemo(
    () =>
      (!isUndefined(ladder) && levelsDriven
        ? getSortedLadderLevelNames(ladder)
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
        getAllNodesFromTree(domainHierarchies?.orderedTree),
        'node.tag',
      );
    }

    if (teamHierarchies && useHierarchy && groupBy === GroupByOption.TEAM) {
      flatTeams = keyBy(
        getAllNodesFromTree(teamHierarchies.orderedParents),
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
          const foundHierarchyItem = findItem(
            items,
            lastPathItem,
          );

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
    if (isEmpty(hierarchyItem?.orderedChildren) || identifier === lastPathItem) {
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
          onSelect={onSelect}
          useHierarchy={useHierarchy}
          hideWithoutChildren={hideWithoutChildren}
          lastPathItem={lastPathItem}
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
      return (
        <HeatmapTableByGroup
          header="Group"
          rules={headers}
          data={data}
          entityCategory={entityCategory}
          onSelect={onSelect}
          useHierarchy={useHierarchy}
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
          onSelect={onSelect}
          useHierarchy={useHierarchy}
          lastPathItem={lastPathItem}
        />
      );
    case GroupByOption.LEVEL:
      return (
        <HeatmapTableByLevels
          ladder={ladder}
          rules={headers}
          data={data}
          entityCategory={entityCategory}
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
          onSelect={onSelect}
          useHierarchy={useHierarchy}
          lastPathItem={lastPathItem}
        />
      );
  }
};
