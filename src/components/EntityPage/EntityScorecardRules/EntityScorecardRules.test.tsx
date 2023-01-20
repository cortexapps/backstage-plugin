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
import { Fixtures, renderWrapped } from '../../../utils/TestUtils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { EntityScorecardRules } from './EntityScorecardRules';

describe('<EntityScorecardRules />', () => {
  const serviceScorecardScore = Fixtures.serviceScorecardScore({
    score: {
      score: 1,
      scorePercentage: 0.33,
      totalPossibleScore: 3,
    },
    scorecard: {
      id: 1,
      name: 'Test Scorecard 1',
      description: 'Test Scorecard 1 description',
    },
    evaluation: {
      rules: [
        {
          rule: {
            id: 1,
            expression: 'git != null',
            weight: 1,
          },
          score: 1,
        },
        {
          rule: {
            id: 2,
            expression: 'oncall != null',
            weight: 2,
          },
          score: 0,
        },
        {
          rule: {
            id: 3,
            expression: 'description != null',
            weight: 1,
          },
          score: 1,
        },
      ],
      ladderLevels: [],
    },
  });

  const entity = Fixtures.entity();

  it('Properly renders EntityScorecardRules', async () => {
    const { checkNotText, clickButtonByText, findByText } = renderWrapped(
      <EntityProvider entity={entity}>
        <EntityScorecardRules score={serviceScorecardScore} />
      </EntityProvider>,
    );
    expect(await findByText('All Rules')).toBeVisible();
    expect(await findByText('Failing (1)')).toBeVisible();
    expect(await findByText('Passing (2)')).toBeVisible();
    expect(await findByText('oncall != null')).toBeVisible();
    await checkNotText('git != null');
    await checkNotText('description != null');

    await clickButtonByText('Passing (2)');
    expect(await findByText('git != null')).toBeVisible();
    expect(await findByText('description != null')).toBeVisible();
    await checkNotText('oncall != null');
  });
});
