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
import React, { useMemo, useState } from 'react';
import { HeaderTabs, InfoCard, Progress } from '@backstage/core-components';
import { ServiceScorecardScore } from '../../../api/types';
import { ScorecardResultDetails } from '../../Scorecards/ScorecardDetailsPage/ScorecardsTableCard/ScorecardResultDetails';
import {
  filterFailingRuleOutcomes,
  filterNotApplicableRuleOutcomes,
  filterNotEvaluatedRuleOutcomes,
  filterPassingRuleOutcomes,
  isNotApplicableRuleOutcome,
  isNotEvaluatedRuleOutcome,
  isRuleOutcomeFailing,
  isRuleOutcomePassing,
} from '../../../utils/ScorecardRules';

interface EntityScorecardRulesProps {
  score?: ServiceScorecardScore;
}

export const EntityScorecardRules = ({ score }: EntityScorecardRulesProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedRuleOutcomes = useMemo(() => {
    return score?.evaluation?.rules?.filter(rule =>
      selectedIndex === 0
        ? isRuleOutcomeFailing(rule)
        : selectedIndex === 1
        ? isRuleOutcomePassing(rule)
        : selectedIndex === 2
        ? isNotApplicableRuleOutcome(rule)
        : isNotEvaluatedRuleOutcome(rule),
    );
  }, [selectedIndex, score]);

  if (score === undefined || selectedRuleOutcomes === undefined) {
    return <Progress />;
  }

  const numPassing = filterPassingRuleOutcomes(score.evaluation.rules).length;
  const numFailing = filterFailingRuleOutcomes(score.evaluation.rules).length;
  const numNotApplicable = filterNotApplicableRuleOutcomes(
    score.evaluation.rules,
  ).length;
  const numNotEvaluated = filterNotEvaluatedRuleOutcomes(
    score.evaluation.rules,
  ).length;

  return (
    <InfoCard title="All Rules">
      <HeaderTabs
        tabs={[
          { id: 'failing', label: `Failing (${numFailing})` },
          { id: 'passing', label: `Passing (${numPassing})` },
          { id: 'not_applicable', label: `Exempt (${numNotApplicable})` },
          {
            id: 'not_evaluated',
            label: `Not Yet Evaluated (${numNotEvaluated})`,
          },
        ]}
        onChange={setSelectedIndex}
      />
      <ScorecardResultDetails ruleOutcomes={selectedRuleOutcomes} />
    </InfoCard>
  );
};
