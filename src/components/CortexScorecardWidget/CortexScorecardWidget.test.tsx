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

import React from 'react';
import { CortexApi } from '../../api/CortexApi';
import { render } from '@testing-library/react';
import { TestApiProvider, wrapInTestApp } from '@backstage/test-utils';
import { cortexApiRef } from '../../api';
import { rootRouteRef } from '../../routes';
import { CortexScorecardWidget } from './CortexScorecardWidget';
import { EntityProvider } from '@backstage/plugin-catalog-react';

describe('<CortexScorecardWidget />', () => {
  const entity = {
    apiVersion: 'v1',
    kind: 'Component',
    metadata: {
      name: 'ExampleComponent',
      annotations: {
        'github.com/project-slug': 'example/project',
      },
    },
    spec: {
      owner: 'guest',
      type: 'service',
      lifecycle: 'production',
    },
  };

  const cortexApi: Partial<CortexApi> = {
    getServiceScores: () =>
      Promise.resolve([
        {
          score: { scorePercentage: 0.42, score: 42, totalPossibleScore: 100 },
          scorecard: { id: 1, name: 'My Scorecard', description: 'test' },
          evaluation: { rules: [], ladderLevels: [] },
        },
      ]),
  };

  const renderWrapped = (children: React.ReactNode) =>
    render(
      wrapInTestApp(
        <TestApiProvider apis={[[cortexApiRef, cortexApi]]}>
          <EntityProvider entity={entity}>{children}</EntityProvider>
        </TestApiProvider>,
        {
          mountedRoutes: {
            '/': rootRouteRef as any,
          },
        },
      ),
    );

  it('test', async () => {
    const { findByText } = renderWrapped(<CortexScorecardWidget />);
    expect(await findByText(/42%/)).toBeInTheDocument();
    expect(await findByText(/My Scorecard/)).toBeInTheDocument();
  });
});
