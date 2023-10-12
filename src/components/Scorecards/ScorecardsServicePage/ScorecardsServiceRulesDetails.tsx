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
import React, { useMemo } from 'react';

import { isEmpty, partition } from 'lodash';
import { RuleOutcome } from '../../../api/types';
import {
  getApplicableRules,
  chainedComparator,
  getRuleTitle,
  filterNotEvaluatedRuleOutcomes,
} from '../../../utils/ScorecardRules';
import { ScorecardsServiceCard } from './ScorecardsServiceCard';
import { ScorecardServiceRuleRow } from './ScorecardsServiceRuleRow';

interface ScorecardsServiceRulesDetailsProps {
  ruleOutcomes: RuleOutcome[];
  hideWeights?: boolean;
}

export const ScorecardsServiceRulesDetails = ({
  ruleOutcomes,
  hideWeights,
}: ScorecardsServiceRulesDetailsProps) => {
  const [failingRules, passingRules] = useMemo(() => {
    const applicableRules = getApplicableRules(ruleOutcomes);
    const sortedRules = [...applicableRules].sort(
      chainedComparator(
        (left, right) => (right?.rule?.weight ?? 0) - (left?.rule?.weight ?? 0),
        (left, right) =>
          getRuleTitle(left?.rule).localeCompare(getRuleTitle(right?.rule)),
      ),
    );
    return partition(sortedRules, { score: 0 });
  }, [ruleOutcomes]);

  const notEvaluatedRules = useMemo(() => {
    return filterNotEvaluatedRuleOutcomes(ruleOutcomes);
  }, [ruleOutcomes]);

  return (
    <>
      {!isEmpty(failingRules) && (
        <ScorecardsServiceCard title="Failing rules">
          {failingRules.map(failingRule => (
            <ScorecardServiceRuleRow
              key={`failing-rule-${failingRule.rule.id}`}
              rule={{
                ...failingRule.rule,
                score: failingRule.score,
              }}
              hideWeight={hideWeights}
            />
          ))}
        </ScorecardsServiceCard>
      )}

      {!isEmpty(passingRules) && (
        <ScorecardsServiceCard title="Passing rules">
          {passingRules.map(passingRule => (
            <ScorecardServiceRuleRow
              key={`passing-rule-${passingRule.rule.id}`}
              rule={{
                ...passingRule.rule,
                score: passingRule.score,
              }}
              hideWeight={hideWeights}
            />
          ))}
        </ScorecardsServiceCard>
      )}

      {!isEmpty(notEvaluatedRules) && (
        <ScorecardsServiceCard title="Not evaluated rules">
          {notEvaluatedRules.map(notEvaluatedRule => (
            <ScorecardServiceRuleRow
              key={`not-evaluated-rule-${notEvaluatedRule.rule.id}`}
              rule={notEvaluatedRule.rule}
              hideWeight={hideWeights}
            />
          ))}
        </ScorecardsServiceCard>
      )}
    </>
  );
};
