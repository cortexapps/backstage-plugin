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
import {
  GroupByOption,
  ScorecardServiceScore,
  ScoresByIdentifier,
  ruleName,
  ScorecardLevel,
  RuleOutcome,
  ScorecardScoreNextSteps,
  TeamHierarchyNode,
  TeamHierarchiesResponse,
} from '../../../api/types';
import { groupBy as _groupBy, flatten as _flatten, values, uniq, intersection } from 'lodash';
import { filterNotUndefined } from '../../../utils/collections';
import { isApplicableRuleOutcome } from '../../../utils/ScorecardRules';
import { HomepageEntity } from '../../../api/userInsightTypes';
import { ScoreFilters } from './HeatmapFiltersModal';

export type StringIndexable<T> = { [index: string]: T };

export const getSortedRuleNames = (score: ScorecardServiceScore): string[] =>
  [...(score?.rules ?? [])]
    .sort((a, b) => ruleName(a.rule).localeCompare(ruleName(b.rule)))
    .map(rule => ruleName(rule.rule));

export const getSortedRulesByLevels = (
  rules: string[],
  levels: ScorecardLevel[] = [],
): string[] => {
  const sorted = [...(levels ?? [])].sort((a, b) => a.rank - b.rank);
  const sortedLevelRules = _flatten(
    sorted.map(level =>
      level.rules
        .map(rule => ruleName(rule))
        .sort((a, b) => a.localeCompare(b)),
    ),
  );
  const remainingRules = rules.filter(rule => !sortedLevelRules.includes(rule));
  return [...sortedLevelRules, ...remainingRules];
};

export const getSortedRulesByLevelsFromScores = (
  sortedRulesByLevels: string[],
  score: ScorecardServiceScore,
): RuleOutcome[] =>
  filterNotUndefined(
    sortedRulesByLevels.map(ruleTitle =>
      score.rules.find(r => ruleName(r.rule) === ruleTitle),
    ),
  );

type GroupByKeys = 'teams' | 'tags' | 'ladderLevels';
type GroupByValues = {
  teams?: string[];
  tags?: string[];
  ladderLevels?: ScorecardScoreNextSteps[];
};

const groupByKeyToLabel: Record<GroupByKeys, string> = {
  teams: 'team',
  tags: 'group',
  ladderLevels: 'level'
}

const groupReportDataBy = <T extends GroupByValues>(
  scores: T[],
  groupBy: GroupByKeys,
): StringIndexable<T[]> => {
  return scores.reduce<StringIndexable<T[]>>((data, score) => {
    const groups = score[groupBy];

    if (!groups?.length) {
      const key = `No ${groupByKeyToLabel[groupBy]}`;
      if (!data[key]) {
        Object.assign(data, { [key]: [] });
      }
      data?.[key].push(score);
    } else {
      groups?.forEach((group: ScorecardScoreNextSteps | string) => {
        const key =
          typeof group === 'string'
            ? group
            : group.currentLevel?.name ?? 'No Level'; // is ScorecardScoreNextSteps

        const exists = data[key];
        if (!exists) {
          Object.assign(data, { [key]: [] });
        }

        data?.[key].push(score);
      });
    }

    return data;
  }, {});
};

export const getScorecardServiceScoresByGroupByOption = (
  scores: ScorecardServiceScore[] | undefined,
  groupBy: GroupByOption | undefined,
): StringIndexable<ScorecardServiceScore[]> => {
  if (scores === undefined || scores.length === 0) {
    return {};
  }

  switch (groupBy) {
    case GroupByOption.ENTITY:
      return _groupBy(scores, (s: ScorecardServiceScore) => s.serviceId);
    case GroupByOption.SERVICE_GROUP:
      return groupReportDataBy(scores, 'tags');
    case GroupByOption.TEAM:
      return groupReportDataBy(scores, 'teams');
    case GroupByOption.LEVEL:
      return groupReportDataBy(scores, 'ladderLevels');
    default:
      return {};
  }
};

export const groupScoresByTeamHierarchies = (groupedScores: StringIndexable<ScorecardServiceScore[]>, teamHierarchies: TeamHierarchiesResponse) => {
  const hierarchyGroupedData = {} as Record<string, ScorecardServiceScore[]>;

  teamHierarchies.orderedParents.forEach((parent) => {
    hierarchyGroupedData[parent.node.tag] = groupedScores[parent.node.tag] ?? [];

    teamHierarchyNodeFlatChildren(parent).forEach((childTag) => {
      (groupedScores[childTag] ?? []).forEach((score) => {
        if (!hierarchyGroupedData[parent.node.tag].find((existingScore) => existingScore.componentRef === score.componentRef)) {
          hierarchyGroupedData[parent.node.tag].push(score);
        }
      });
    });
  });

  return hierarchyGroupedData;
}

export const catalogToRelationsByEntityId = (entitiesByTag: StringIndexable<HomepageEntity>) => {
  const ownerEmailByEntityId = {} as Record<string, string[]>;
  const groupTagByEntityId = {} as Record<string, string[]>;

  Object.values(entitiesByTag).forEach((entity) => {
    if (entity.serviceOwnerEmails.length) {
      const ownerEmails = entity.serviceOwnerEmails.map(({ email }) => email);
      if (ownerEmailByEntityId[entity.id]) {
        ownerEmailByEntityId[entity.id] = uniq([...ownerEmails, ...ownerEmailByEntityId[entity.id]]);
      } else {
        ownerEmailByEntityId[entity.id] = ownerEmails;
      }
    }

    if (entity.serviceGroupTags) {
      if (groupTagByEntityId[entity.id]) {
        groupTagByEntityId[entity.id] = uniq([...entity.serviceGroupTags, ...groupTagByEntityId[entity.id]]);
      } else {
        groupTagByEntityId[entity.id] = entity.serviceGroupTags;
      }
    }
  });

  return {
    ownerEmailByEntityId,
    groupTagByEntityId
  };
}

export const applyScoreFilters = (
  scores: ScorecardServiceScore[],
  scoreFilters: ScoreFilters,
  ownerEmailByEntityId: StringIndexable<string[]>,
  groupTagByEntityId: StringIndexable<string[]>
) => {
  let resultScores = scores;

  if (scoreFilters.serviceIds.length) {
    resultScores = resultScores.filter((score) => scoreFilters.serviceIds.includes(score.serviceId));
  }
  if (scoreFilters.groups.length) {
    resultScores = resultScores.filter(
      (score) => intersection(scoreFilters.groups, groupTagByEntityId?.[score.serviceId]).length
    );
  }
  if (scoreFilters.teams.length) {
    resultScores = resultScores.filter((score) => intersection(scoreFilters.teams, score.teams).length);
  }
  if (scoreFilters.users.length) {
    resultScores = resultScores.filter(
      (score) => intersection(scoreFilters.users, ownerEmailByEntityId?.[score.serviceId]).length
    );
  }

  return resultScores;
}

interface ScorecardRuleMetadata {
  ruleName: string;
  totalServicesScore: number;
  numApplicableServices: number;
}

export const getAverageRuleScores = (
  scores: ScorecardServiceScore[],
): number[] => {
  const ruleIdToScoreMetadata: Record<number, ScorecardRuleMetadata> = {};
  scores.forEach(score =>
    score.rules.forEach(ruleOutcome => {
      if (ruleIdToScoreMetadata[ruleOutcome.rule.id] === undefined) {
        ruleIdToScoreMetadata[ruleOutcome.rule.id] = {
          ruleName: ruleName(ruleOutcome.rule),
          totalServicesScore: 0,
          numApplicableServices: 0,
        };
      }
      if (isApplicableRuleOutcome(ruleOutcome)) {
        const scorecardRuleMetadata =
          ruleIdToScoreMetadata[ruleOutcome.rule.id];
        ruleIdToScoreMetadata[ruleOutcome.rule.id] = {
          ruleName: ruleName(ruleOutcome.rule),
          totalServicesScore:
            scorecardRuleMetadata.totalServicesScore +
            (ruleOutcome.score ? 1 : 0),
          numApplicableServices:
            scorecardRuleMetadata.numApplicableServices + 1,
        };
      }
    }),
  );
  return values(ruleIdToScoreMetadata)
    .sort((a, b) => a.ruleName.localeCompare(b.ruleName))
    .map(
      metadata =>
        metadata.totalServicesScore /
        Math.max(metadata.numApplicableServices, 1),
    );
};

export const getServicesInLevelsFromScores = (
  ladderLevels: string[],
  scores: ScorecardServiceScore[],
): ScorecardServiceScore[][] => {
  const groupedByLevels = groupReportDataBy(scores, 'ladderLevels');
  return ladderLevels.map(level => groupedByLevels[level] ?? []);
};

export const getFormattedScorecardScores = (
  scorecardNames: string[],
  scores: ScoresByIdentifier[],
) => {
  // Since we're using the same ScorecardScoresByIdentifier type, there can be cases where the scores object is undefined,
  // in which case we don't wanna return any results, forcing the components to refetch the data
  if (scores.filter(s => s.scores.length > 0).length === 0) {
    return [];
  }

  return scores.map(groupScore => {
    const allScores = scorecardNames.map(name =>
      groupScore.scores.find(score => score?.scorecardName === name),
    );

    return {
      ...groupScore,
      scores: allScores,
    };
  });
};

export const teamHierarchyNodeFlatChildren = (node: TeamHierarchyNode): string[] => {
  return node.orderedChildren.flatMap((child) => [child.node.tag, ...teamHierarchyNodeFlatChildren(child)]);
}
