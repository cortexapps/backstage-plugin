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
  Filters
} from "@cortexapps/birdseye";
import { DomainHierarchiesResponse, DomainHierarchyNode, EntityFilter, FilterType, RuleOutcome, Scorecard, ScorecardLadder, ScorecardServiceScore } from '../../../api/types';
import { HomepageEntity } from '../../../api/userInsightTypes';
import { mapKeys, mapValues } from 'lodash';
import { HeatmapSettings } from './HeatmapSettings';

const convertToBirdsEyeFilterType = (filterType: Exclude<EntityFilter['type'], FilterType.CQL_FILTER>): Exclude<BirdsEyeFilterType, BirdsEyeFilterType.CQL_FILTER> => {
  switch (filterType) {
    case FilterType.SERVICE_FILTER: return BirdsEyeFilterType.SERVICE_FILTER;
    case FilterType.DOMAIN_FILTER: return BirdsEyeFilterType.DOMAIN_FILTER;
    case FilterType.RESOURCE_FILTER: return BirdsEyeFilterType.RESOURCE_FILTER;
    case FilterType.TEAM_FILTER: return BirdsEyeFilterType.TEAM_FILTER;
  }
};

const convertToBirdsEyeFilter = (filter: Scorecard['filter']): BirdsEyeScorecard['filter'] => {
  return !filter
  ? undefined
  : filter?.type === FilterType.COMPOUND_FILTER
  ? {
    ...filter,
    type: "COMPOUND_FILTER",
    cqlFilter: filter.cqlFilter ? {
      ...filter.cqlFilter,
      type: BirdsEyeFilterType.CQL_FILTER,
    } : undefined,
  } : filter?.type === FilterType.CQL_FILTER ? {
    ...filter,
    type: BirdsEyeFilterType.CQL_FILTER
  } : {
    ...filter,
    type: convertToBirdsEyeFilterType(filter.type)
  };
};

const convertToBirdsEyeScorecard = (scorecard: Scorecard, ladder: ScorecardLadder | undefined): BirdsEyeScorecard => {
  const rules: BirdsEyeScorecard['rules'] = scorecard.rules.map((rule) => ({
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
      enabled: false
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

const convertToBirdsEyeRuleOutcome = (rules: RuleOutcome[]): BirdsEyeRuleOutcome[] => {
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

const convertToBirdsEyeScores = (scores: ScorecardServiceScore[], catalog: HomepageEntity[]): ScorecardDetailsScore[] => {
  return scores.map((score: ScorecardServiceScore): ScorecardDetailsScore => {
    const entity = catalog.find((item => item.id === score.serviceId));
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
      }
    };
  });
};

const convertToBirdsEyeDomainNodeMetadata = (item: DomainHierarchyNode): DomainTreeNode => {
  return {
    ...item,
    node: {
      ...item.node,
      description: item.node.description ?? undefined,
      id: item.node.id.toString(),
    },
    orderedChildren: item.orderedChildren.map(convertToBirdsEyeDomainNodeMetadata)
  };
};

const convertToBirdsEyeDomainHierarchy = (hierarchies?: DomainHierarchiesResponse): BirdsEyeDomainsHierarchyResponse | undefined => {
  return {
    ...hierarchies,
    orderedTree: hierarchies?.orderedTree.map(convertToBirdsEyeDomainNodeMetadata) ?? []
  };
};

interface HeatmapTableProps {
  allTeams: TeamResponse[];
  catalog: HomepageEntity[];
  domainHierarchy: DomainHierarchiesResponse | undefined;
  allDomains: Domain[];
  domainAncestryMap: Record<number, number[]>;
  filters: Filters,
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
  filters,
  ladder,
  scorecard,
  scores,
  setFilters,
  teamsByEntity,
  teamHierarchy
}) => {
  const mappedScorecard = convertToBirdsEyeScorecard(scorecard, ladder);
  const mappedScores = convertToBirdsEyeScores(scores, catalog);
  const mappedDomainHierarchies = convertToBirdsEyeDomainHierarchy(domainHierarchy);
  const mappedDomainAncestryMapKeys = mapKeys(domainAncestryMap, key => key.toString());
  const mappedDomainAncestryMap = mapValues(mappedDomainAncestryMapKeys, values => values.map(value => value.toString()));

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

  return (
    <>
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
      <BirdsEyeReportTable
        {...tableData}
        emptyResultDisplay={<EmptyState title="Select a Scorecard" missing="data" />}
        filters={filters}
        getCellColorClassName={() => 'aa'}
        getScoreColorClassName={() => 'bb'}
        getScorecardEntityUrl={() => ''}
        setFilters={setFilters}
      />
    </>
  );
};
