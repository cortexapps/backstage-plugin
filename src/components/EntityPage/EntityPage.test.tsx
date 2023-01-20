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
import { CortexApi } from '../../api/CortexApi';
import React from 'react';
import { Fixtures, renderWrapped } from '../../utils/TestUtils';
import { EntityPage } from './EntityPage';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { rootRouteRef } from '../../routes';

describe('EntityPage', () => {
  const emptyCortexApi: Partial<CortexApi> = {
    getServiceScores: () => Promise.resolve([]),
  };
  const cortexApi: Partial<CortexApi> = {
    getServiceScores: () =>
      Promise.resolve([
        {
          score: { scorePercentage: 0.33, score: 1, totalPossibleScore: 3 },
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
            ],
            ladderLevels: [],
          },
        },
        {
          score: { scorePercentage: 1, score: 1, totalPossibleScore: 1 },
          scorecard: {
            id: 2,
            name: 'Test Scorecard 2',
            description: 'Test Scorecard 2 description',
          },
          evaluation: {
            rules: [
              {
                rule: {
                  id: 1,
                  expression: 'description != null',
                  weight: 1,
                },
                score: 1,
              },
            ],
            ladderLevels: [],
          },
        },
      ]),
  };

  const entity = Fixtures.entity();

  it('should render if there are no scorecard service scores', async () => {
    const { checkForText } = renderWrapped(
      <EntityProvider entity={entity}>
        <EntityPage />
      </EntityProvider>,
      emptyCortexApi,
    );
    await checkForText('No Scorecards to display');
    await checkForText("You haven't added any Scorecards yet.");
  });

  it('should render scorecard service scores', async () => {
    const { checkForText, checkNotText, clickButtonByText } = renderWrapped(
      <EntityProvider entity={entity}>
        <EntityPage />
      </EntityProvider>,
      cortexApi,
      {
        '/': rootRouteRef,
      },
    );
    await checkForText('Test Scorecard 1');
    await checkForText('Test Scorecard 2');
    await checkForText('oncall != null');
    await checkNotText('git != null');
    await checkNotText('description != null');

    await clickButtonByText('Passing (1)');
    await checkNotText('oncall != null');
    await checkForText('git != null');

    await clickButtonByText('Test Scorecard 2');
    await checkNotText('description != null');
    await checkNotText('git != null');
    await checkNotText('oncall != null');

    await clickButtonByText('Passing (1)');
    await checkForText('description != null');
  });
});
