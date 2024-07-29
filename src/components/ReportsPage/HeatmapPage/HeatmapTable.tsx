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
  Filters,
  FilterType as BirdsEyeFilterType,
  TeamResponse,
  DomainsHierarchyResponse,
  Domain,
  Scorecard as BirdsEyeScorecard,
  ScorecardDetailsScore,
  HierarchyResponse,
  StringIndexable,
  TeamDetails,
  CategoryFilter as BirdsEyeCategoryFilter,
  RuleOutcome as BirdsEyeRuleOutcome
} from "@cortexapps/birdseye";
import { EntityFilter, FilterType, RuleOutcome, Scorecard, ScorecardServiceScore } from '../../../api/types';
import { HomepageEntity } from '../../../api/userInsightTypes';

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

const convertToBirdsEyeScorecard = (scorecard: Scorecard): BirdsEyeScorecard => {
  const rules: BirdsEyeScorecard['rules'] = scorecard.rules.map((rule) => ({
    ...rule,
    cqlVersion: '', // TODO
    dateCreated: rule.dateCreated ?? '', // TODO
    filter: convertToBirdsEyeFilter({
      query: rule.filter?.query ?? '',
      category: BirdsEyeCategoryFilter.Domain, // TODO
      cqlVersion: '', // TODO
      type: BirdsEyeFilterType.CQL_FILTER // TODO
    }),
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
        ladderLevels: score.ladderLevels.map(level => ({
          ...level,
          rulesToComplete: level.rulesToComplete.map(rule => ({
            ...rule,
            cqlVersion: '', // TODO
          }))
        })),
        lastUpdated: '',
      }
    };
  });
};

interface HeatmapTableProps {
  allTeams: TeamResponse[];
  catalog: HomepageEntity[];
  domainHierarchy: DomainsHierarchyResponse | undefined;
  allDomains: Domain[];
  domainAncestryMap: Record<string, string[]>;
  filters: Filters,
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
  scorecard,
  scores,
  setFilters,
  teamsByEntity,
  teamHierarchy
}) => {

  const mappedScorecard = convertToBirdsEyeScorecard(scorecard);

  const {
    tableData,
    // setDataFilters,
    // resetFilters,
    // groupByOptions,
    // setReportType,
    // filtersConfig,
    // entityCategory,
    // setHideTeamsWithoutEntities,
    // filtersAppliedCount,
    // setGroupBy,
    // setUseHierarchy,
    // showHierarchy,
    // groupBy,
    // shouldShowReportType,
    // breadcrumbItems,
    // onBreadcrumbClick,
  } = useCortexBirdseye({
    allDomains,
    allTeams,
    domainAncestryMap,
    domainHierarchy,
    filters,
    scorecard: mappedScorecard,
    scores: convertToBirdsEyeScores(scores, catalog),
    setFilters,
    teamHierarchy,
    teamsByEntity,
  });

  console.log('bb', tableData);

  return (
    <BirdsEyeReportTable
      {...tableData}
      emptyResultDisplay={<EmptyState title="Select a Scorecard" missing="data" />}
      filters={filters}
      getCellColorClassName={() => 'aa'}
      getScoreColorClassName={() => 'bb'}
      getScorecardEntityUrl={() => ''}
      setFilters={setFilters}
    />
  );
};
