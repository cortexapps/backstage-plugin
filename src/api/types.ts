/*
 * Copyright 2021 Cortex Applications Inc.
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
  serviceGroups: ServiceGroup[];
  nextUpdated?: string;
}

export interface Rule {
  id: string;
  expression: string;
  description?: string;
  title?: string;
  weight: number;
  dateCreated: string;
}

export function ruleName(rule: Rule): string {
  return rule.title ?? rule.expression
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
  serviceName: string;
  serviceTag: string;
  serviceGroups?: string[];
  ownerGroups?: string[];
  scorecardId: string;
  score: number;
  scorePercentage: number;
  totalPossibleScore: number;
  rules: ScorecardServiceScoresRule[];
  lastUpdated: string;
}

export interface ScorecardServiceScoresRule {
  rule: Rule;
  score: number;
  error?: string;
}
