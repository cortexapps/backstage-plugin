/*
 * Copyright 2022 Cortex Applications, Inc.
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
import { CortexApi } from '../../../api/CortexApi';
import { render } from '@testing-library/react';
import { TestApiProvider, wrapInTestApp } from '@backstage/test-utils';
import React from 'react';
import { cortexApiRef } from '../../../api';
import { ScorecardsPage } from './ScorecardsPage';
import { rootRouteRef } from '../../../routes';

type AnyFunction = (args?: [] | [any]) => any;
type ApiOverrides = Record<string, AnyFunction>;

describe('ScorecardsPage', () => {
  const getCortexApi = (overrides?: ApiOverrides): Partial<CortexApi> => ({
    getScorecards: () =>
      Promise.resolve([
        {
          creator: { name: 'Billy Bob', email: 'billybob@cortex.io' },
          id: 1,
          name: 'My Scorecard',
          description: 'Some description',
          rules: [],
          tags: [],
          excludedTags: [],
          filterQuery: undefined,
          nextUpdated: '2021-08-25T04:00:00',
        },
      ]),
    ...overrides,
  });

  const renderWrapped = (children: React.ReactNode, overrides?: ApiOverrides) =>
    render(
      wrapInTestApp(
        <TestApiProvider apis={[[cortexApiRef, getCortexApi(overrides)]]}>
          {children}
        </TestApiProvider>,
        {
          mountedRoutes: {
            '/': rootRouteRef as any,
          },
        },
      ),
    );

  it('should render', async () => {
    const { findByText } = renderWrapped(<ScorecardsPage />);
    expect(await findByText(/My Scorecard/)).toBeVisible();
    expect(await findByText(/Some description/)).toBeVisible();
  });

  it('should render empty state if no scorecards', async () => {
    const emptyGetScorecards = () => Promise.resolve([]);
    const { findByText } = renderWrapped(<ScorecardsPage />, {
      getScorecards: emptyGetScorecards,
    });
    expect(await findByText(/No scorecards to display/)).toBeVisible();
    expect(
      await findByText(/You haven't added any scorecards yet/),
    ).toBeVisible();
  });
});
