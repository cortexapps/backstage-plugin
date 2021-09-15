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

export interface Scorecard {
  creator: { name: string; email: string };
  id: string;
  name: string;
  description?: string;
  rules: Rule[];
  tags: ServiceGroup[];
  nextUpdated?: string;
}

export interface RuleName {
  expression: string;
  title?: string;
  weight: number;
}

export interface Rule extends RuleName {
  id: string;
  description?: string;
  dateCreated: string;
}

export function ruleName(rule: RuleName): string {
  return rule.title ?? rule.expression;
}

export interface ServiceGroup {
  id: string;
  tag: string;
}

export interface ServiceScorecardScore {
  scorecardId: string;
  scorecardName: string;
  scorePercentage: number;
  score: number;
  totalPossibleScore: number;
}

export interface ScorecardServiceScore {
  serviceId: string;
  componentRef: string;
  score: number;
  scorePercentage: number;
  totalPossibleScore: number;
  rules: ScorecardServiceScoresRule[];
  lastUpdated: string;
  tags: string[];
}

export interface ScorecardServiceScoresRule {
  rule: Rule;
  score: number;
  error?: string;
}

export interface ScorecardResult {
  scorecardId: string;
  componentRef: string;
  totalScore: number;
  possibleScore: number;
  ruleResults: RuleResult[];
  dateCreated: string;
}

export interface RuleResult {
  id: string;
  expression: string;
  result: boolean;
  score: number;
  weight: number;
  error?: string;
  leftExpression?: string;
  leftResult?: any;
  rightExpression?: string;
  rightResult?: any;
  operation: string;
}

export interface Initiative {
  creator: { name: string; email: string };
  description?: string;
  id: string;
  name: string;
  scorecard: Scorecard;
  scores: InitiativeServiceScores[];
  componentRefs: string[];
  emphasizedRules: InitiativeRule[];
  targetDate: string;
  targetScore?: number;
  tags: ServiceGroup[];
}

export interface InitiativeRule {
  ruleId: string;
  expression: string;
}

export interface InitiativeServiceScores {
  scorePercentage: number;
  componentRef: string;
}

export interface InitiativeActionItem {
  rule: Rule;
  componentRef: string;
  initiative: {
    initiativeId: string;
    name: string;
    targetDate: string;
    targetScore?: number;
    description?: string;
  };
}
