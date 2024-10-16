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
import { isNil } from 'lodash';
import {
  ApplicableRuleOutcome,
  CompoundFilter,
  EntityFilter,
  NotApplicableRuleOutcome,
  NotEvaluatedRuleOutcome,
  Rule,
  ruleName,
  RuleOutcome,
  RuleOutcomeType,
  ScorecardLevelRule,
} from '../api/types';
import { isNotNullOrEmpty } from './strings';

export interface RuleDetail {
  description?: string;
  expression: string;
  failureMessage?: string;
  filter?: EntityFilter | CompoundFilter | null;
  id: number | string;
  score?: number;
  title?: string;
  weight?: number;
  error?: string;
}

export const isApplicableRuleOutcome = (
  rule: RuleOutcome | undefined,
): rule is ApplicableRuleOutcome => rule?.type === RuleOutcomeType.APPLICABLE;

export const isNotApplicableRuleOutcome = (
  rule: RuleOutcome | undefined,
): rule is NotApplicableRuleOutcome =>
  rule?.type === RuleOutcomeType.NOT_APPLICABLE;

export const isNotEvaluatedRuleOutcome = (
  rule: RuleOutcome | undefined,
): rule is NotEvaluatedRuleOutcome =>
  rule?.type === RuleOutcomeType.NOT_EVALUATED;

export const getApplicableRules = (
  rules: RuleOutcome[],
): ApplicableRuleOutcome[] => {
  return rules.filter(isApplicableRuleOutcome);
};

export function isRuleOutcomePassing(ruleOutcome: RuleOutcome): boolean {
  return isApplicableRuleOutcome(ruleOutcome) && ruleOutcome.score > 0;
}

export function isRuleOutcomeFailing(ruleOutcome: RuleOutcome): boolean {
  return isApplicableRuleOutcome(ruleOutcome) && ruleOutcome.score === 0;
}

export const isRuleFailing = (rule: RuleDetail) =>
  !isNil(rule.score) && (rule.score ?? 0) <= 0;

export function filterPassingRuleOutcomes(
  ruleOutcomes: RuleOutcome[],
): RuleOutcome[] {
  return ruleOutcomes.filter(isRuleOutcomePassing);
}

export function filterFailingRuleOutcomes(
  ruleOutcomes: RuleOutcome[],
): RuleOutcome[] {
  return ruleOutcomes.filter(isRuleOutcomeFailing);
}

export function filterNotApplicableRuleOutcomes(
  ruleOutcomes: RuleOutcome[],
): NotApplicableRuleOutcome[] {
  return ruleOutcomes.filter(
    (ruleOutcome): ruleOutcome is NotApplicableRuleOutcome =>
      ruleOutcome.type === 'NOT_APPLICABLE',
  );
}

export function filterNotEvaluatedRuleOutcomes(
  ruleOutcomes: RuleOutcome[],
): NotEvaluatedRuleOutcome[] {
  return ruleOutcomes.filter(
    (ruleOutcome): ruleOutcome is NotEvaluatedRuleOutcome =>
      ruleOutcome.type === 'NOT_EVALUATED',
  );
}

export const getRuleTitle = (
  rule: Rule | ScorecardLevelRule | RuleDetail,
): string => {
  return isNotNullOrEmpty(rule.title) ? rule.title : rule.expression;
};

type Comparator<T> = (a: T, b: T) => number; // -1 | 0 | 1

export function chainedComparator<T>(
  ...comparators: Comparator<T>[]
): Comparator<T> {
  return (a: T, b: T) => {
    let order = 0;
    let i = 0;

    while (!order && comparators[i]) {
      order = comparators[i++](a, b);
    }

    return order;
  };
}

export function sortRules<
  T extends {
    expression: string;
    title?: string;
    score?: number;
    weight?: number;
  },
>(rules: T[]) {
  return [...rules].sort(
    chainedComparator(
      (a, b) => (b?.score ?? 0) - (a?.score ?? 0),
      (a, b) => (b?.weight ?? 0) - (a?.weight ?? 0),
      (a, b) => ruleName(a).localeCompare(ruleName(b)),
    ),
  );
}
