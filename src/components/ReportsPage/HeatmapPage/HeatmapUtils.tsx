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
import {
  FilterType as BirdsEyeFilterType,
  DomainsHierarchyResponse as BirdsEyeDomainsHierarchyResponse,
  Scorecard as BirdsEyeScorecard,
  ScorecardDetailsScore,
  RuleOutcome as BirdsEyeRuleOutcome,
  DomainTreeNode,
  Filters,
  PathType,
  DomainOwnerInheritance,
  Rule as BirdsEyeRule,
  useCortexBirdseye
} from '@cortexapps/birdseye';
import {
  DomainHierarchiesResponse,
  DomainHierarchyNode,
  EntityFilter,
  FilterType,
  OwnerInheritance,
  Rule,
  RuleOutcome,
  Scorecard,
  ScorecardLadder,
  ScorecardServiceScore,
  TeamHierarchiesResponse,
  TeamHierarchyNode,
} from '../../../api/types';
import { HomepageEntity } from '../../../api/userInsightTypes';
import { Link } from '@backstage/core-components';
import { makeStyles, Theme } from '@material-ui/core';

type BirdsEyeHierarchyResponse = NonNullable<Parameters<typeof useCortexBirdseye>[0]['teamHierarchy']>;
type BirdsEyeHierarchyNode = BirdsEyeHierarchyResponse['orderedParents'][number];

export const filtersToParams = (filters: Filters) => {
  return {
    scorecardId: filters.scorecardId,
    entity: filters.dataFilters.selectedEntities,
    group: filters.dataFilters.selectedGroups,
    team: filters.dataFilters.selectedTeams,
    domain: filters.dataFilters.selectedDomains,
    level: filters.dataFilters.selectedLevels,
    owner: filters.dataFilters.selectedOwners,
    groupBy: filters.path.find(({ type }) => type === PathType.GroupBy)?.label,
    showHierarchy: filters.useHierarchy ? 'true' : undefined,
    hideWithoutChildren: filters.hideTeamsWithoutServices ? undefined : 'false',
    headerType: filters.headerType,
  };
};

export const convertToBirdsEyeFilterType = (
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

export const convertToBirdsEyeOwnerInheritance = (
  inheritance: OwnerInheritance,
): DomainOwnerInheritance => {
  switch (inheritance) {
    case OwnerInheritance.Append:
      return DomainOwnerInheritance.Append;
    case OwnerInheritance.Fallback:
      return DomainOwnerInheritance.Fallback;
    case OwnerInheritance.None:
      return DomainOwnerInheritance.None;
  }
};

export const convertToBirdsEyeFilter = (
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

export const convertToBirdsEyeRule = (rule: Rule): BirdsEyeRule => {
  return {
    ...rule,
    cqlVersion: rule.cqlVersion,
    dateCreated: rule.dateCreated ?? '',
    filter: convertToBirdsEyeFilter(rule.filter),
    id: rule.id.toString(),
  };
};

export const convertToBirdsEyeScorecard = (
  scorecard: Scorecard,
  ladder: ScorecardLadder | undefined,
): BirdsEyeScorecard => {
  const rules: BirdsEyeScorecard['rules'] = scorecard.rules.map(
    convertToBirdsEyeRule,
  );

  return {
    ...scorecard,
    filter: convertToBirdsEyeFilter(scorecard.filter),
    id: scorecard.id.toString(),
    rules,
    ladder,
  };
};

export const convertToBirdsEyeRuleOutcome = (
  rules: RuleOutcome[],
): BirdsEyeRuleOutcome[] => {
  return rules.map(
    (rule: RuleOutcome): BirdsEyeRuleOutcome => ({
      ...rule,
      rule: convertToBirdsEyeRule(rule.rule),
    }),
  );
};

export const convertToBirdsEyeScores = (
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
        cid: score.cid,
        entityGroups: {
          all: score.tags,
          defined: score.tags,
        },
        entityOwners: score.entityOwners.map(owner => ({
          ...owner,
          id: owner.id?.toString() ?? '',
          inheritance: convertToBirdsEyeOwnerInheritance(owner.inheritance),
        })),
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
        lastUpdated: score.lastUpdated,
      },
    };
  });
};

export const convertToBirdsEyeDomainNodeMetadata = (
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

export const convertToBirdsEyeDomainHierarchy = (
  hierarchies?: DomainHierarchiesResponse,
): BirdsEyeDomainsHierarchyResponse | undefined => {
  return {
    ...hierarchies,
    orderedTree:
      hierarchies?.orderedTree.map(convertToBirdsEyeDomainNodeMetadata) ?? [],
  };
};

export const convertToBirdsEyeTeamNodeMetadata = (
  item: TeamHierarchyNode,
): BirdsEyeHierarchyNode => {
  return {
    ...item,
    node: {
      ...item.node,
      description: item.node.description ?? undefined,
      id: item.node.id.toString(),
    },
    orderedChildren: item.orderedChildren.map(
      convertToBirdsEyeTeamNodeMetadata,
    ),
  };
};

export const convertToBirdsEyeTeamHierarchy = (
  hierarchies?: TeamHierarchiesResponse,
): BirdsEyeHierarchyResponse | undefined => {
  return {
    ...hierarchies,
    orderedParents:
      hierarchies?.orderedParents.map(convertToBirdsEyeTeamNodeMetadata) ?? [],
  };
};

export const getScoreColorClassName = (points: number): string => {
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

export const getCellColorBackground = (value?: number): string => {
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

export const BirdsEyeAnchorAdapter = (
  props: React.DetailedHTMLProps<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  >,
) => {
  return <Link to={props.href ?? ''}>{props.children}</Link>;
};

export const useTableStyles = makeStyles((theme: Theme) => ({
  table: {
    '& table thead': {
      backgroundColor: `${theme.palette.background.default}`,
    },
    '& table tr th': {
      backgroundColor: `${theme.palette.background.paper} !important`,
    },
    '& table tr td.cortex-entity-count-cell': {
      backgroundColor: `${theme.palette.background.default}`,
      border: `1px solid ${theme.palette.background.default}`,
    },
    '& table tr td:first-child': {
      backgroundColor: `${theme.palette.background.paper}`,
    }
  },
}));
