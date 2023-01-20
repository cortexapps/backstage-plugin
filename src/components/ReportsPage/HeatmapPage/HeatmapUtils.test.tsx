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
import { getAverageRuleScores } from './HeatmapUtils';
import { Fixtures } from '../../../utils/TestUtils';
import { round } from 'lodash';

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

  const scorecardServiceScores = [
    Fixtures.scorecardServiceScore({
      rules: [
        {
          rule: gitRule,
          score: 1,
        },
        {
          rule: oncallRule,
          score: 0,
        },
        {
          rule: descriptionRule,
          score: 1,
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
        },
        {
          rule: oncallRule,
          score: 0,
        },
        {
          rule: descriptionRule,
          score: 1,
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
        },
        {
          rule: oncallRule,
          score: 2,
        },
        {
          rule: descriptionRule,
          score: 1,
        },
      ],
    }),
  ];

  it('getAverageRuleScores math', async () => {
    // rule order should be description rule => oncall rule => git rule since they're sorted alphabetically by rule name (rule title, or rule expression if no title)
    const averageRuleScores = getAverageRuleScores(
      scorecardServiceScores,
      3,
    ).map(averageRuleScore => round(averageRuleScore, 2));
    expect(averageRuleScores).toEqual([1, 0.33, 0.67]);
  });
});
