/*
 * Copyright 2021 Cortex Applications, Inc.
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
  ScorecardScoreLadderResult,
  ScorecardServiceScore,
  ScorecardServiceScoresRule,
  ScoresByIdentifier,
  ruleName,
  ScorecardLevel,
} from '../../../api/types';
import { groupBy as _groupBy, flatten as _flatten } from 'lodash';
import { filterNotUndefined } from '../../../utils/collections';

export type StringIndexable<T> = { [index: string]: T };

export const getSortedRuleNames = (score: ScorecardServiceScore): string[] =>
  [...(score?.rules ?? [])]
    .sort((a, b) => ruleName(a.rule).localeCompare(ruleName(b.rule)))
    .map(rule => ruleName(rule.rule));

export const getSortedRulesFromScores = (
  score: ScorecardServiceScore,
): ScorecardServiceScoresRule[] =>
  [...(score?.rules ?? [])].sort((a, b) =>
    ruleName(a.rule).localeCompare(ruleName(b.rule)),
  );

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
): ScorecardServiceScoresRule[] =>
  filterNotUndefined(
    sortedRulesByLevels.map(ruleTitle =>
      score.rules.find(r => ruleName(r.rule) === ruleTitle),
    ),
  );

type GroupByKeys = 'teams' | 'tags' | 'ladderLevels';
type GroupByValues = {
  teams?: string[];
  tags?: string[];
  ladderLevels?: ScorecardScoreLadderResult[];
};

const groupReportDataBy = <T extends GroupByValues>(
  scores: T[],
  groupBy: GroupByKeys,
): StringIndexable<T[]> => {
  return scores.reduce<StringIndexable<T[]>>((data, score) => {
    const groups = score[groupBy];

    groups?.forEach((group: ScorecardScoreLadderResult | string) => {
      const key =
        typeof group === 'string'
          ? group
          : group.currentLevel?.name ?? 'No Level'; // is ScorecardScoreLadderResult

      const exists = data[key];
      if (!exists) {
        Object.assign(data, { [key]: [] });
      }

      data?.[key].push(score);
    });

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
    case GroupByOption.SERVICE:
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

export const getAverageRuleScores = (
  scores: ScorecardServiceScore[],
  serviceCount: number,
): number[] => {
  return scores
    .map(score => getSortedRulesFromScores(score).map(rule => rule.score))
    .reduce((r, a) => a.map((b, i) => (r[i] || 0) + (b ? 1 : 0)), [])
    .map(score => score / serviceCount);
};

export const getServicesInLevelsFromScores = (
  ladderLevels: string[],
  scores: ScorecardServiceScore[],
): ScorecardServiceScore[][] => {
  const groupedByLevels = groupReportDataBy(scores, 'ladderLevels');
  return ladderLevels.map(level => groupedByLevels[level] ?? []);
};

export const getAverageRuleScoresByLevels = (
  sortedRulesByLevels: string[],
  scores: ScorecardServiceScore[],
  serviceCount: number,
): number[] => {
  return scores
    .map(score =>
      getSortedRulesByLevelsFromScores(sortedRulesByLevels, score).map(
        rule => rule.score,
      ),
    )
    .reduce((r, a) => a.map((b, i) => (r[i] || 0) + (b ? 1 : 0)), [])
    .map(score => score / serviceCount);
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
