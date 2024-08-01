/*
 * Copyright 2024 Cortex Applications, Inc.
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
import { EmptyState } from '@backstage/core-components';
import {
  useCortexBirdseye,
  BirdsEyeReportTable,
  FilterType as BirdsEyeFilterType,
  TeamResponse,
  DomainsHierarchyResponse as BirdsEyeDomainsHierarchyResponse,
  Domain,
  Scorecard as BirdsEyeScorecard,
  ScorecardDetailsScore,
  HierarchyResponse,
  StringIndexable,
  TeamDetails,
  RuleOutcome as BirdsEyeRuleOutcome,
  DomainTreeNode,
  Filters,
} from '@cortexapps/birdseye';
import {
  DomainHierarchiesResponse,
  DomainHierarchyNode,
  EntityFilter,
  FilterType,
  RuleOutcome,
  Scorecard,
  ScorecardLadder,
  ScorecardServiceScore,
} from '../../../api/types';
import { HomepageEntity } from '../../../api/userInsightTypes';
import { mapKeys, mapValues } from 'lodash';
import { HeatmapSettings } from './HeatmapSettings';
import { useColorCellStyles } from './colorClasses';
import { Grid } from '@material-ui/core';
import { useRouteRef } from '@backstage/core-plugin-api';
import { scorecardServiceDetailsRouteRef } from '../../../routes';
import { defaultComponentRefContext, entityComponentRef } from '../../../utils/ComponentUtils';
import { parseEntityRef } from '@backstage/catalog-model';

const convertToBirdsEyeFilterType = (
  filterType: Exclude<EntityFilter['type'], FilterType.CQL_FILTER>,
): Exclude<BirdsEyeFilterType, BirdsEyeFilterType.CQL_FILTER> => {
  switch (filterType) {
    case FilterType.SERVICE_FILTER:
      return BirdsEyeFilterType.SERVICE_FILTER;
    case FilterType.DOMAIN_FILTER:
      return BirdsEyeFilterType.DOMAIN_FILTER;
    case FilterType.RESOURCE_FILTER:
      return BirdsEyeFilterType.RESOURCE_FILTER;
    case FilterType.TEAM_FILTER:
      return BirdsEyeFilterType.TEAM_FILTER;
  }
};

const convertToBirdsEyeFilter = (
  filter: Scorecard['filter'],
): BirdsEyeScorecard['filter'] => {
  return !filter
    ? undefined
    : filter?.type === FilterType.COMPOUND_FILTER
    ? {
        ...filter,
        type: 'COMPOUND_FILTER',
        cqlFilter: filter.cqlFilter
          ? {
              ...filter.cqlFilter,
              type: BirdsEyeFilterType.CQL_FILTER,
            }
          : undefined,
      }
    : filter?.type === FilterType.CQL_FILTER
    ? {
        ...filter,
        type: BirdsEyeFilterType.CQL_FILTER,
      }
    : {
        ...filter,
        type: convertToBirdsEyeFilterType(filter.type),
      };
};

const convertToBirdsEyeScorecard = (
  scorecard: Scorecard,
  ladder: ScorecardLadder | undefined,
): BirdsEyeScorecard => {
  const rules: BirdsEyeScorecard['rules'] = scorecard.rules.map(rule => ({
    ...rule,
    cqlVersion: '', // TODO
    dateCreated: rule.dateCreated ?? '',
    filter: convertToBirdsEyeFilter(rule.filter),
    id: rule.id.toString(),
  }));

  return {
    ...scorecard,
    exemptions: {
      autoApprove: false,
      enabled: false,
    },
    isDraft: false,
    notifications: {
      enabled: false,
    },
    filter: convertToBirdsEyeFilter(scorecard.filter),
    id: scorecard.id.toString(),
    rules,
    ladder,
  };
};

const convertToBirdsEyeRuleOutcome = (
  rules: RuleOutcome[],
): BirdsEyeRuleOutcome[] => {
  return rules.map((rule: RuleOutcome): BirdsEyeRuleOutcome => {
    const mappedRule = {
      ...rule.rule,
      cqlVersion: '',
      dateCreated: rule.rule.dateCreated ?? '',
      filter: undefined,
      id: rule.rule.id.toString(),
    };

    return {
      ...rule,
      rule: mappedRule,
    };
  });
};

const convertToBirdsEyeScores = (
  scores: ScorecardServiceScore[],
  catalog: HomepageEntity[],
): ScorecardDetailsScore[] => {
  return scores.map((score: ScorecardServiceScore): ScorecardDetailsScore => {
    const entity = catalog.find(item => item.id === score.serviceId);
    return {
      score: {
        score: score.score,
        scorePercentage: score.scorePercentage,
        totalPossibleScore: score.totalPossibleScore,
      },
      entity: {
        cid: '', // TODO
        entityGroups: {
          all: score.tags,
          defined: score.tags,
        },
        entityOwners: [], // TODO
        id: score.serviceId.toString(),
        name: entity?.name ?? '',
        ownerGroups: score.teams,
        tag: score.componentRef,
        type: entity?.type ?? '',
        description: score.description,
        icon: entity?.icon,
      },
      evaluation: {
        rules: convertToBirdsEyeRuleOutcome(score.rules),
        ladderLevels: score.ladderLevels,
        lastUpdated: '',
      },
    };
  });
};

const convertToBirdsEyeDomainNodeMetadata = (
  item: DomainHierarchyNode,
): DomainTreeNode => {
  return {
    ...item,
    node: {
      ...item.node,
      description: item.node.description ?? undefined,
      id: item.node.id.toString(),
    },
    orderedChildren: item.orderedChildren.map(
      convertToBirdsEyeDomainNodeMetadata,
    ),
  };
};

const convertToBirdsEyeDomainHierarchy = (
  hierarchies?: DomainHierarchiesResponse,
): BirdsEyeDomainsHierarchyResponse | undefined => {
  return {
    ...hierarchies,
    orderedTree:
      hierarchies?.orderedTree.map(convertToBirdsEyeDomainNodeMetadata) ?? [],
  };
};

const getScoreColorClassName = (points: number): string => {
  if (points > 0.9) {
    return 'success1';
  } else if (points > 0.8) {
    return 'success2';
  } else if (points > 0.7) {
    return 'success3';
  } else if (points > 0.6) {
    return 'warning1';
  } else if (points > 0.5) {
    return 'warning2';
  } else if (points > 0.4) {
    return 'warning3';
  } else if (points > 0.3) {
    return 'danger1';
  } else if (points > 0.2) {
    return 'danger2';
  }

  return 'danger3';
};

const getCellColorBackground = (value?: number): string => {
  if (value === null || value === undefined) {
    return 'danger3';
  }

  if (value > 0.9) {
    return 'success1';
  } else if (value > 0.49) {
    return 'warning2';
  } else {
    return 'danger3';
  }
};

interface HeatmapTableProps {
  allDomains: Domain[];
  allTeams: TeamResponse[];
  catalog: HomepageEntity[];
  domainHierarchy: DomainHierarchiesResponse | undefined;
  domainAncestryMap: Record<number, number[]>;
  entitiesByTag: StringIndexable<HomepageEntity>;
  filters: Filters;
  ladder?: ScorecardLadder;
  scorecard: Scorecard;
  scores: ScorecardServiceScore[];
  setFilters: (filters: Filters) => void;
  teamHierarchy?: HierarchyResponse;
  teamsByEntity: StringIndexable<TeamDetails[]> | undefined;
}

export const HeatmapTable: React.FC<HeatmapTableProps> = ({
  allDomains,
  allTeams,
  catalog,
  domainAncestryMap,
  domainHierarchy,
  entitiesByTag,
  filters,
  ladder,
  scorecard,
  scores,
  setFilters,
  teamsByEntity,
  teamHierarchy,
}) => {
  const colorStyles = useColorCellStyles();
  const mappedScorecard = convertToBirdsEyeScorecard(scorecard, ladder);
  const mappedScores = convertToBirdsEyeScores(scores, catalog);
  const mappedDomainHierarchies =
    convertToBirdsEyeDomainHierarchy(domainHierarchy);
  const mappedDomainAncestryMapKeys = mapKeys(domainAncestryMap, key =>
    key.toString(),
  );
  const mappedDomainAncestryMap = mapValues(
    mappedDomainAncestryMapKeys,
    values => values.map(value => value.toString()),
  );

  const {
    tableData,
    setDataFilters,
    groupByOptions,
    setReportType,
    filtersConfig,
    setHideTeamsWithoutEntities,
    setGroupBy,
    setUseHierarchy,
    showHierarchy,
    groupBy,
    shouldShowReportType,
  } = useCortexBirdseye({
    allDomains,
    allTeams,
    domainAncestryMap: mappedDomainAncestryMap,
    domainHierarchy: mappedDomainHierarchies,
    
    filters,
    scorecard: mappedScorecard,
    scores: mappedScores,
    setFilters,
    teamHierarchy,
    teamsByEntity,
  });

  const scorecardServiceDetailsRef = useRouteRef(
    scorecardServiceDetailsRouteRef,
  );

  return (
    <Grid container direction={'column'}>
      <Grid item style={{ marginTop: '20px' }}>
        <HeatmapSettings
          filters={filters}
          groupByOptions={groupByOptions}
          setGroupBy={setGroupBy}
          filtersConfig={filtersConfig}
          groupBy={groupBy}
          setDataFilters={setDataFilters}
          setHideTeamsWithoutEntities={setHideTeamsWithoutEntities}
          setReportType={setReportType}
          setUseHierarchy={setUseHierarchy}
          shouldShowReportType={shouldShowReportType}
          showHierarchy={showHierarchy}
        />
      </Grid>
      <Grid item>
        <BirdsEyeReportTable
          {...tableData}
          emptyResultDisplay={
            <EmptyState title="Select a Scorecard" missing="data" />
          }
          filters={filters}
          getCellColorClassName={points =>
            `${colorStyles.root} ${colorStyles[getCellColorBackground(points)]}`
          }
          getScoreColorClassName={points =>
            `${colorStyles.root} ${colorStyles[getScoreColorClassName(points)]}`
          }
          getScorecardEntityUrl={(scorecardEntity) => {
            const entityId = Number.parseInt(scorecardEntity.entityId);
            const entity = catalog.find(entity => entityId === entity.id);
            const codeTag = entity?.codeTag;
            if (!codeTag) {
              return '';
            }

            const componentRef = entityComponentRef(
              entitiesByTag,
              codeTag,
            );

            const entityName = parseEntityRef(componentRef, defaultComponentRefContext);

            const entityUrl = scorecardServiceDetailsRef({
              scorecardId: `${mappedScorecard.id}`,
              ...entityName,
            });
            
            return entityUrl;
          }}
          setFilters={setFilters}
        />
      </Grid>
    </Grid>
  );
};
