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
import React from 'react';
import { ScorecardResultDetails } from './ScorecardResultDetails';
import {
  ApplicableRuleOutcome,
  NotApplicableRuleOutcome,
  NotEvaluatedRuleOutcome,
  RuleOutcome,
} from '../../../../api/types';
import { shallow } from 'enzyme';

describe('ScorecardResultDetails', () => {
  const gitRule = {
    id: 1,
    expression: 'git != null',
    weight: 1,
  };
  const oncallRule = {
    id: 2,
    expression: 'oncall != null',
    title: 'abc oncall',
    weight: 1,
  };
  const docsRule = {
    id: 3,
    expression: 'documentation.count > 0',
    weight: 1,
  };
  const descriptionRule = {
    id: 4,
    expression: 'description != null',
    weight: 1,
  };
  const k8sRule = {
    id: 5,
    expression: 'k8s != null',
    weight: 1,
  };
  const customRule = {
    id: 6,
    expression: 'custom("my_key") != null',
    weight: 1,
  };

  const getScorecardResultDetails = (ruleOutcomes: RuleOutcome[]) =>
    shallow(<ScorecardResultDetails ruleOutcomes={ruleOutcomes} />);

  it('check order of applicable scorecard service rules being displayed', async () => {
    const applicableOutcomes = [
      {
        rule: gitRule,
        score: 1,
        type: 'APPLICABLE',
      } as ApplicableRuleOutcome,
      {
        rule: oncallRule,
        score: 1,
        type: 'APPLICABLE',
      } as ApplicableRuleOutcome,
      {
        rule: docsRule,
        requestedDate: '05/05/2000',
        approvedDate: '05/05/2000',
        type: 'NOT_APPLICABLE',
      } as NotApplicableRuleOutcome,
      {
        rule: descriptionRule,
        score: 1,
        type: 'APPLICABLE',
      } as ApplicableRuleOutcome,
      {
        rule: k8sRule,
        score: 0,
        type: 'APPLICABLE',
      } as ApplicableRuleOutcome,
      {
        rule: customRule,
        type: 'NOT_EVALUATED',
      } as NotEvaluatedRuleOutcome,
    ];
    // First rule displayed is k8s (since score is 0)
    // Then rules with score 1, in alphabetical order of title or expression: oncall => description => git
    // Lastly, not applicable and not evaluated rules in alphabetical order: custom => docs
    const scorecardResultDetails =
      getScorecardResultDetails(applicableOutcomes);
    expect(scorecardResultDetails).toMatchSnapshot();
  });
});
