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
import { getAverageRuleScores } from './HeatmapUtils';
import { Fixtures } from '../../../utils/TestUtils';
import { round } from 'lodash';
import { RuleOutcomeType } from '../../../api/types';

describe('HeatmapUtils', () => {
  const gitRule = {
    id: 1,
    expression: 'git != null',
    weight: 1,
  };
  const oncallRule = {
    id: 2,
    expression: 'oncall != null',
    title: 'Does oncall exist',
    weight: 2,
  };
  const descriptionRule = {
    id: 3,
    expression: 'description != null',
    weight: 1,
  };
  const customRule = {
    id: 4,
    expression: 'custom("key") != null',
    title: 'Key custom var exists',
    weight: 1,
  };
  const k8sRule = {
    id: 5,
    expression: 'k8s != null',
    title: 'e so this is after description rule and before git rule',
    weight: 1,
  };

  const scorecardServiceScores = [
    Fixtures.scorecardServiceScore({
      rules: [
        {
          rule: gitRule,
          score: 1,
          type: RuleOutcomeType.APPLICABLE,
        },
        {
          rule: oncallRule,
          score: 0,
          type: RuleOutcomeType.APPLICABLE,
        },
        {
          rule: descriptionRule,
          score: 1,
          type: RuleOutcomeType.APPLICABLE,
        },
      ],
    }),
    Fixtures.scorecardServiceScore({
      serviceId: 2,
      componentRef: 'Component:bar/foo',
      score: 1,
      scorePercentage: 0.25,
      rules: [
        {
          rule: gitRule,
          score: 0,
          type: RuleOutcomeType.APPLICABLE,
        },
        {
          rule: oncallRule,
          score: 0,
          type: RuleOutcomeType.APPLICABLE,
        },
        {
          rule: descriptionRule,
          score: 1,
          type: RuleOutcomeType.APPLICABLE,
        },
      ],
    }),
    Fixtures.scorecardServiceScore({
      serviceId: 3,
      componentRef: 'Component:lorem/ipsum',
      score: 4,
      scorePercentage: 1,
      rules: [
        {
          rule: gitRule,
          score: 1,
          type: RuleOutcomeType.APPLICABLE,
        },
        {
          rule: oncallRule,
          score: 2,
          type: RuleOutcomeType.APPLICABLE,
        },
        {
          rule: descriptionRule,
          score: 1,
          type: RuleOutcomeType.APPLICABLE,
        },
      ],
    }),
  ];

  const scorecardServiceScoresWithExemptions = [
    Fixtures.scorecardServiceScore({
      rules: [
        {
          rule: gitRule,
          score: 1,
          type: RuleOutcomeType.APPLICABLE,
        },
        {
          rule: oncallRule,
          score: 0,
          type: RuleOutcomeType.APPLICABLE,
        },
        {
          rule: descriptionRule,
          score: 1,
          type: RuleOutcomeType.APPLICABLE,
        },
        {
          rule: customRule,
          type: RuleOutcomeType.NOT_EVALUATED,
        },
        {
          rule: k8sRule,
          requestedDate: '05/05/2000',
          approvedDate: '05/05/2000',
          type: RuleOutcomeType.NOT_APPLICABLE,
        },
      ],
    }),
    Fixtures.scorecardServiceScore({
      serviceId: 2,
      componentRef: 'Component:bar/foo',
      score: 1,
      scorePercentage: 0.25,
      rules: [
        {
          rule: gitRule,
          score: 0,
          type: RuleOutcomeType.APPLICABLE,
        },
        {
          rule: oncallRule,
          score: 0,
          type: RuleOutcomeType.APPLICABLE,
        },
        {
          rule: descriptionRule,
          score: 1,
          type: RuleOutcomeType.APPLICABLE,
        },
        {
          rule: customRule,
          type: RuleOutcomeType.NOT_EVALUATED,
        },
        {
          rule: k8sRule,
          score: 0,
          type: RuleOutcomeType.APPLICABLE,
        },
      ],
    }),
    Fixtures.scorecardServiceScore({
      serviceId: 3,
      componentRef: 'Component:lorem/ipsum',
      score: 4,
      scorePercentage: 1,
      rules: [
        {
          rule: gitRule,
          score: 1,
          type: RuleOutcomeType.APPLICABLE,
        },
        {
          rule: oncallRule,
          score: 2,
          type: RuleOutcomeType.APPLICABLE,
        },
        {
          rule: descriptionRule,
          score: 1,
          type: RuleOutcomeType.APPLICABLE,
        },
        {
          rule: customRule,
          type: RuleOutcomeType.NOT_EVALUATED,
        },
        {
          rule: k8sRule,
          score: 1,
          type: RuleOutcomeType.APPLICABLE,
        },
      ],
    }),
  ];

  it('getAverageRuleScores math without exempt rules', async () => {
    // rule order should be description rule => oncall rule => git rule since they're sorted alphabetically by rule name (rule title, or rule expression if no title)
    const averageRuleScores = getAverageRuleScores(scorecardServiceScores).map(
      averageRuleScore => round(averageRuleScore, 2),
    );
    expect(averageRuleScores).toEqual([1, 0.33, 0.67]);
  });

  it('getAverageRuleScores math with exempt rules', async () => {
    // rule order should be description rule => oncall rule => k8s rule => git rule => custom rule since they're sorted alphabetically by rule name (rule title, or rule expression if no title)
    const averageRuleScores = getAverageRuleScores(
      scorecardServiceScoresWithExemptions,
    ).map(averageRuleScore => round(averageRuleScore, 2));
    expect(averageRuleScores).toEqual([1, 0.33, 0.5, 0.67, 0]);
  });
});
