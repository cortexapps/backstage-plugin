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
import { EntityScorecardOverview } from './EntityScorecardOverview';
import { Fixtures, renderWrapped } from '../../../utils/TestUtils';
import { CortexApi } from '../../../api/CortexApi';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { rootRouteRef } from '../../../routes';
import { waitFor } from '@testing-library/react';

describe('<EntityScorecardOverview />', () => {
  const gitRule = {
    id: 1,
    expression: 'git != null',
    weight: 1,
  };
  const oncallRule = {
    id: 2,
    expression: 'oncall != null',
    weight: 2,
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
          rule: gitRule,
          score: 1,
          type: 'APPLICABLE',
        },
        {
          rule: oncallRule,
          score: 0,
          type: 'APPLICABLE',
        },
        {
          rule: docsRule,
          requestedDate: '05/05/2000',
          approvedDate: '05/05/2000',
          type: 'NOT_APPLICABLE',
        },
        {
          rule: descriptionRule,
          type: 'NOT_EVALUATED',
        },
      ],
      ladderLevels: [],
    },
  });
  const cortexApi: Partial<CortexApi> = {
    getScorecardScores: () =>
      Promise.resolve([
        Fixtures.scorecardServiceScore({
          componentRef: 'foo',
          score: 1,
          scorePercentage: 0.33,
          totalPossibleScore: 3,
          rules: [
            {
              rule: gitRule,
              score: 1,
              type: 'APPLICABLE',
            },
            {
              rule: oncallRule,
              score: 0,
              type: 'APPLICABLE',
            },
            {
              rule: docsRule,
              requestedDate: '05/05/2000',
              approvedDate: '05/05/2000',
              type: 'NOT_APPLICABLE',
            },
            {
              rule: descriptionRule,
              type: 'NOT_EVALUATED',
            },
          ],
        }),
      ]),
  };

  const entity = Fixtures.entity();

  it('Renders EntityScorecardOverview', async () => {
    const { getByText, getByTestId } = renderWrapped(
      <EntityProvider entity={entity}>
        <EntityScorecardOverview score={serviceScorecardScore} />
      </EntityProvider>,
      cortexApi,
      {
        '/': rootRouteRef,
      },
    );
    await waitFor(() => expect(getByText('Percentile')).toBeVisible());
    expect(getByTestId('Stat-Rank')).toHaveTextContent('1st');
    expect(getByTestId('Stat-Percentile')).toHaveTextContent('100th');
    expect(getByTestId('Stat-Failing Rules')).toHaveTextContent('1');
  });
});
