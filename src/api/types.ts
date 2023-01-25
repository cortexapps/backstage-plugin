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

interface ScorecardCreator {
  name: string;
  email: string;
}

export interface Scorecard {
  creator: ScorecardCreator;
  id: number;
  name: string;
  description?: string;
  rules: Rule[];
  tags: ServiceGroup[];
  excludedTags: ServiceGroup[];
  filterQuery?: string;
  nextUpdated?: string;
}

export interface RuleName {
  expression: string;
  title?: string;
}

export interface Rule extends RuleName {
  id: number;
  description?: string;
  failureMessage?: string;
  dateCreated?: string;
  weight: number;
}

export function ruleName(rule: RuleName): string {
  return rule.title ?? rule.expression;
}

export interface ServiceGroup {
  id: string;
  tag: string;
}

export interface ScorecardLevelRule {
  id: string;
  levelId: string;
  expression: string;
  title?: string;
  description?: string;
}

export interface ScorecardLevel {
  id: string;
  name: string;
  description?: string;
  color: string;
  rank: number;
  rules: ScorecardLevelRule[];
}

export interface ScorecardLadder {
  id: string;
  scorecardId: string;
  name: string;
  description?: string;
  levels: ScorecardLevel[];
}

export interface ScorecardScoreLadderDetails {
  id: string;
  name: string;
}

export interface ScorecardScoreLadderLevel {
  name: string;
  color: string;
  rank: number;
}

export interface ScorecardScoreLadderResult {
  ladderDetails: ScorecardScoreLadderDetails;
  currentLevel?: ScorecardScoreLadderLevel;
}

export interface ScorecardScoreNextSteps {
  currentLevel?: ScorecardScoreLadderLevel;
  nextLevel?: ScorecardScoreLadderLevel;
  rulesToComplete: ScorecardLevelRule[];
}

export interface ServiceLadderLevels {
  serviceId: number;
  ladderDetails: {
    id: number;
    name: string;
  };
  currentLevel?: {
    name: string;
    color: string;
    rank: number;
  };
}

export interface ServiceScorecardScore {
  score: {
    scorePercentage: number;
    score: number;
    totalPossibleScore: number;
  };
  scorecard: {
    id: number;
    name: string;
    description?: string;
  };
  evaluation: {
    rules: RuleOutcome[];
    ladderLevels: ServiceLadderLevels[];
  };
}

export interface ScorecardServiceScore {
  serviceId: number;
  componentRef: string;
  score: number;
  scorePercentage: number;
  totalPossibleScore: number;
  rules: RuleOutcome[];
  lastUpdated: string;
  tags: string[]; // service groups
  teams: string[]; // owner groups
  ladderLevels: ScorecardScoreLadderResult[];
}

export type RuleOutcome =
  | NotEvaluatedRuleOutcome
  | ApplicableRuleOutcome
  | NotApplicableRuleOutcome;

export enum RuleOutcomeType {
  APPLICABLE = 'APPLICABLE',
  NOT_APPLICABLE = 'NOT_APPLICABLE',
  NOT_EVALUATED = 'NOT_EVALUATED',
}

export interface RuleOutcomeBase {
  rule: Rule;
  type: RuleOutcomeType;
}

export interface NotEvaluatedRuleOutcome {
  rule: Rule;
  type: RuleOutcomeType.NOT_EVALUATED;
}

export interface ApplicableRuleOutcome extends RuleOutcomeBase {
  score: number;
  leftResult?: number | string;
  error?: string;
  type: RuleOutcomeType.APPLICABLE;
}

export interface NotApplicableRuleOutcome extends RuleOutcomeBase {
  endDate?: string;
  requestedDate: string;
  approvedDate: string;
  type: RuleOutcomeType.NOT_APPLICABLE;
}

export interface ScorecardResult {
  scorecardId: number;
  componentRef: string;
  totalScore: number;
  possibleScore: number;
  ruleResults: RuleResult[];
  dateCreated: string;
}

export interface RuleResult {
  id: number;
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

export interface ScoresByIdentifier {
  identifier?: string;
  scores: ScorecardScore[];
  numberOfServices: number;
}

export enum GroupByOption {
  SERVICE = 'Service',
  TEAM = 'Team',
  SERVICE_GROUP = 'Service Group',
  LEVEL = 'Level',
}

export enum HeaderType {
  RULES = 'Rules',
  LEVELS = 'Levels',
}

export interface ScorecardScore {
  scorecardId: number;
  scorecardName?: string;
  scorePercentage: number;
  dateCreated?: string;
}

export interface Initiative {
  creator: { name: string; email: string };
  description?: string;
  id: number;
  name: string;
  scorecard: Scorecard;
  emphasizedRules: InitiativeRule[];
  emphasizedLevels: InitiativeLevel[];
  targetDate: string;
  targetScore?: number;
  // filters
  tags: ServiceGroup[];
  componentRefs: string[];
}

export interface InitiativeWithScores extends Initiative {
  scores: InitiativeServiceScores[];
}

export interface InitiativeRule {
  ruleId: number;
  expression: string;
  title: string;
  description?: string;
}

export interface InitiativeLevel {
  ladderId: number;
  levelId: number;
  levelName: string;
  levelColor: string;
}

export interface InitiativeServiceScores {
  scorePercentage: number;
  componentRef: string;
}

export interface InitiativeActionItem {
  rule: Rule;
  componentRef: string;
  initiative: {
    initiativeId: number;
    name: string;
    targetDate: string;
    targetScore?: number;
    description?: string;
  };
}
