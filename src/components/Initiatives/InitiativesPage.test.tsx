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
import React from 'react';
import { render } from '@testing-library/react';
import { TestApiProvider, wrapInTestApp } from '@backstage/test-utils';

import { CortexApi } from '../../api/CortexApi';
import { cortexApiRef } from '../../api';
import { rootRouteRef } from '../../routes';
import { InitiativesPage } from './InitiativesPage';
import { Initiative, Scorecard } from '../../api/types';

type AnyFunction = (args?: [] | [any]) => any;
type ApiOverrides = Record<string, AnyFunction>;

describe('Initiatives Page', () => {
  const creator = {
    name: 'David Developer',
    email: 'david.developer@cortex.io',
  };
  const mockScorecard: Scorecard = {
    creator,
    description: 'Some description',
    exemptions: {
      autoApprove: false,
      enabled: false,
    },
    id: 1,
    isDraft: false,
    name: 'Scorecard 1',
    notifications: {
      enabled: false,
    },
    rules: [],
    tag: '',
    filter: null,
  };
  const getCortexApi = (overrides?: ApiOverrides): Partial<CortexApi> => ({
    getInitiatives: () =>
      Promise.resolve([
        {
          entityGroups: [],
          levels: [],
          description: 'Some description',
          id: '1',
          name: 'My Initiative',
          rules: [],
          scorecard: mockScorecard,
          targetDate: '2025-01-01T08:00:00',
        } as Initiative,
      ]),
    getScorecards: () => Promise.resolve([mockScorecard]),
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
    const { findByText } = renderWrapped(<InitiativesPage />);
    expect(await findByText(/Initiatives/)).toBeVisible();
    expect(await findByText(/Some description/)).toBeVisible();
  });

  it('should render empty state if no initiatives', async () => {
    const emptyGetInitiatives = () => Promise.resolve([]);
    const { findByText } = renderWrapped(<InitiativesPage />, {
      getInitiatives: emptyGetInitiatives,
    });
    expect(await findByText(/No Initiatives to display/)).toBeVisible();
    expect(
      await findByText(/You haven't added any Initiatives yet/),
    ).toBeVisible();
  });
});
