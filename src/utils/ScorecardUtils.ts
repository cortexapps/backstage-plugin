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
import { ScorecardServiceScoreRuleName } from '../components/Scorecards/ScorecardDetailsPage/ScorecardsTableCard/ScorecardResultDetails';
import { RuleResult } from '../api/types';

/**
 * Convert cached results to standardized RuleName version.
 * TODO: Use current scorecards' rules to use titles where possible
 * @param cachedRuleResults Cached historical results per rule.
 */
export function toScorecardServiceScoreRuleName(
  cachedRuleResults: RuleResult[],
): ScorecardServiceScoreRuleName[] {
  return cachedRuleResults.map(ruleResult => {
    return {
      ...ruleResult,
      rule: {
        expression: ruleResult.expression,
        weight: ruleResult.weight,
      },
    };
  });
}
