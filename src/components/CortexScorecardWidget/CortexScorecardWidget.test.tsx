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
import { CortexApi } from '../../api/CortexApi';
import { render } from '@testing-library/react';
import { TestApiProvider, wrapInTestApp } from '@backstage/test-utils';
import { cortexApiRef } from '../../api';
import { rootRouteRef } from '../../routes';
import { CortexScorecardWidget } from './CortexScorecardWidget';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { extensionApiRef } from "../../api/ExtensionApi";
import { Scorecard } from "../../api/types";

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
    getServiceScores: () => {
      return Promise.resolve([
        {
          score: { scorePercentage: 0.42, score: 42, totalPossibleScore: 100 },
          scorecard: {
            id: 1,
            name: 'Test Scorecard 1',
            description: 'Test Scorecard 1 description',
          },
          evaluation: { rules: [], ladderLevels: [] },
        },
        {
          score: { scorePercentage: 0.15, score: 15, totalPossibleScore: 100 },
          scorecard: {
            id: 2,
            name: 'Test Scorecard 2',
            description: 'Test Scorecard 2 description',
          },
          evaluation: { rules: [], ladderLevels: [] },
        },
        {
          score: { scorePercentage: 1, score: 100, totalPossibleScore: 100 },
          scorecard: {
            id: 3,
            name: 'Test Scorecard 3',
            description: 'Test Scorecard 3 description',
          },
          evaluation: { rules: [], ladderLevels: [] },
        },
        {
          score: { scorePercentage: 0.5, score: 50, totalPossibleScore: 100 },
          scorecard: {
            id: 4,
            name: 'Basic Scorecard',
            description: 'This scorecard handles the basics.',
          },
          evaluation: { rules: [], ladderLevels: [] },
        },
        {
          score: { scorePercentage: 0.75, score: 75, totalPossibleScore: 100 },
          scorecard: { id: 5, name: 'Migration', description: '' },
          evaluation: { rules: [], ladderLevels: [] },
        },
      ])
    },

    getScorecards(): Promise<Scorecard[]> {
      return Promise.resolve([]);
    }
  };

  const renderWrapped = (children: React.ReactNode) =>
    render(
      wrapInTestApp(
        <TestApiProvider apis={[[cortexApiRef, cortexApi], [extensionApiRef, {}]]}>
          <EntityProvider entity={entity}>{children}</EntityProvider>
        </TestApiProvider>,
        {
          mountedRoutes: {
            '/': rootRouteRef as any,
          },
        },
      ),
    );

  it('Properly renders CortexScorecardWidget', async () => {
    const { findByText } = renderWrapped(<CortexScorecardWidget />);
    expect(await findByText(/42%/)).toBeVisible();
    expect(await findByText(/Test Scorecard 1/)).toBeVisible();
    expect(await findByText(/15%/)).toBeVisible();
    expect(await findByText(/Test Scorecard 2/)).toBeVisible();
    expect(await findByText(/100%/)).toBeVisible();
    expect(await findByText(/Test Scorecard 3/)).toBeVisible();
    expect(await findByText(/50%/)).toBeVisible();
    expect(await findByText(/Basic Scorecard/)).toBeVisible();
    expect(await findByText(/75%/)).toBeVisible();
    expect(await findByText(/Migration/)).toBeVisible();
  });

  it('Properly handles includeFilters for ids', async () => {
    const { findByText, queryByText } = renderWrapped(
      <CortexScorecardWidget includeFilters={{ ids: [1, 3, 5] }} />,
    );
    expect(await findByText(/42%/)).toBeVisible();
    expect(await findByText(/Test Scorecard 1/)).toBeVisible();
    expect(await findByText(/100%/)).toBeVisible();
    expect(await findByText(/Test Scorecard 3/)).toBeVisible();
    expect(await findByText(/75%/)).toBeVisible();
    expect(await findByText(/Migration/)).toBeVisible();

    // excluded based on filters
    expect(await queryByText(/15%/)).not.toBeInTheDocument();
    expect(await queryByText(/Test Scorecard 2/)).not.toBeInTheDocument();
    expect(await queryByText(/50%/)).not.toBeInTheDocument();
    expect(await queryByText(/Basic Scorecard/)).not.toBeInTheDocument();
  });

  it('Properly handles includeFilters for names', async () => {
    const { findByText, queryByText } = renderWrapped(
      <CortexScorecardWidget
        includeFilters={{ names: ['test', 'migration'] }}
      />,
    );
    expect(await findByText(/42%/)).toBeVisible();
    expect(await findByText(/Test Scorecard 1/)).toBeVisible();
    expect(await findByText(/15%/)).toBeVisible();
    expect(await findByText(/Test Scorecard 2/)).toBeVisible();
    expect(await findByText(/100%/)).toBeVisible();
    expect(await findByText(/Test Scorecard 3/)).toBeVisible();
    expect(await findByText(/75%/)).toBeVisible();
    expect(await findByText(/Migration/)).toBeVisible();

    // excluded based on filters
    expect(await queryByText(/50%/)).not.toBeInTheDocument();
    expect(await queryByText(/Basic Scorecard/)).not.toBeInTheDocument();
  });

  it('Properly handles includeFilters for scores', async () => {
    const { findByText, queryByText } = renderWrapped(
      <CortexScorecardWidget includeFilters={{ scores: [1] }} />,
    );
    expect(await findByText(/100%/)).toBeVisible();
    expect(await findByText(/Test Scorecard 3/)).toBeVisible();

    // excluded based on filters
    expect(await queryByText(/42%/)).not.toBeInTheDocument();
    expect(await queryByText(/Test Scorecard 1/)).not.toBeInTheDocument();
    expect(await queryByText(/15%/)).not.toBeInTheDocument();
    expect(await queryByText(/Test Scorecard 2/)).not.toBeInTheDocument();
    expect(await queryByText(/50%/)).not.toBeInTheDocument();
    expect(await queryByText(/Basic Scorecard/)).not.toBeInTheDocument();
    expect(await queryByText(/75%/)).not.toBeInTheDocument();
    expect(await queryByText(/Migration/)).not.toBeInTheDocument();
  });

  it('Properly handles complex includeFilters', async () => {
    const { findByText, queryByText } = renderWrapped(
      <CortexScorecardWidget
        includeFilters={{ ids: [1, 2], names: ['basic'], scores: [1] }}
      />,
    );
    expect(await findByText(/42%/)).toBeVisible();
    expect(await findByText(/Test Scorecard 1/)).toBeVisible();
    expect(await findByText(/15%/)).toBeVisible();
    expect(await findByText(/Test Scorecard 2/)).toBeVisible();
    expect(await findByText(/100%/)).toBeVisible();
    expect(await findByText(/Test Scorecard 3/)).toBeVisible();
    expect(await findByText(/50%/)).toBeVisible();
    expect(await findByText(/Basic Scorecard/)).toBeVisible();

    // excluded based on filters
    expect(await queryByText(/75%/)).not.toBeInTheDocument();
    expect(await queryByText(/Migration/)).not.toBeInTheDocument();
  });

  it('Properly handles excludeFilters for ids', async () => {
    const { findByText, queryByText } = renderWrapped(
      <CortexScorecardWidget excludeFilters={{ ids: [1, 3, 5] }} />,
    );
    expect(await queryByText(/42%/)).not.toBeInTheDocument();
    expect(await queryByText(/Test Scorecard 1/)).not.toBeInTheDocument();
    expect(await queryByText(/100%/)).not.toBeInTheDocument();
    expect(await queryByText(/Test Scorecard 3/)).not.toBeInTheDocument();
    expect(await queryByText(/75%/)).not.toBeInTheDocument();
    expect(await queryByText(/Migration/)).not.toBeInTheDocument();

    // included based on filters
    expect(await findByText(/15%/)).toBeVisible();
    expect(await findByText(/Test Scorecard 2/)).toBeVisible();
    expect(await findByText(/50%/)).toBeVisible();
    expect(await findByText(/Basic Scorecard/)).toBeVisible();
  });

  it('Properly handles excludeFilters for names', async () => {
    const { findByText, queryByText } = renderWrapped(
      <CortexScorecardWidget
        excludeFilters={{ names: ['test', 'migration'] }}
      />,
    );
    expect(await queryByText(/42%/)).not.toBeInTheDocument();
    expect(await queryByText(/Test Scorecard 1/)).not.toBeInTheDocument();
    expect(await queryByText(/15%/)).not.toBeInTheDocument();
    expect(await queryByText(/Test Scorecard 2/)).not.toBeInTheDocument();
    expect(await queryByText(/100%/)).not.toBeInTheDocument();
    expect(await queryByText(/Test Scorecard 3/)).not.toBeInTheDocument();
    expect(await queryByText(/75%/)).not.toBeInTheDocument();
    expect(await queryByText(/Migration/)).not.toBeInTheDocument();

    // included based on filters
    expect(await findByText(/50%/)).toBeVisible();
    expect(await findByText(/Basic Scorecard/)).toBeVisible();
  });

  it('Properly handles excludeFilters for scores', async () => {
    const { findByText, queryByText } = renderWrapped(
      <CortexScorecardWidget excludeFilters={{ scores: [1] }} />,
    );
    expect(await queryByText(/100%/)).not.toBeInTheDocument();
    expect(await queryByText(/Test Scorecard 3/)).not.toBeInTheDocument();

    // included based on filters
    expect(await findByText(/42%/)).toBeVisible();
    expect(await findByText(/Test Scorecard 1/)).toBeVisible();
    expect(await findByText(/15%/)).toBeVisible();
    expect(await findByText(/Test Scorecard 2/)).toBeVisible();
    expect(await findByText(/50%/)).toBeVisible();
    expect(await findByText(/Basic Scorecard/)).toBeVisible();
    expect(await findByText(/75%/)).toBeVisible();
    expect(await findByText(/Migration/)).toBeVisible();
  });

  it('Properly handles complex excludeFilters', async () => {
    const { findByText, queryByText } = renderWrapped(
      <CortexScorecardWidget
        excludeFilters={{ ids: [1, 2], names: ['basic'], scores: [1] }}
      />,
    );
    expect(await queryByText(/42%/)).not.toBeInTheDocument();
    expect(await queryByText(/Test Scorecard 1/)).not.toBeInTheDocument();
    expect(await queryByText(/15%/)).not.toBeInTheDocument();
    expect(await queryByText(/Test Scorecard 2/)).not.toBeInTheDocument();
    expect(await queryByText(/100%/)).not.toBeInTheDocument();
    expect(await queryByText(/Test Scorecard 3/)).not.toBeInTheDocument();
    expect(await queryByText(/50%/)).not.toBeInTheDocument();
    expect(await queryByText(/Basic Scorecard/)).not.toBeInTheDocument();

    // included based on filters
    expect(await findByText(/75%/)).toBeVisible();
    expect(await findByText(/Migration/)).toBeVisible();
  });

  it('Properly handles includeFilters & excludeFilters', async () => {
    const { findByText, queryByText } = renderWrapped(
      <CortexScorecardWidget
        includeFilters={{ ids: [1], names: ['basic'] }}
        excludeFilters={{ scores: [1] }}
      />,
    );

    expect(await findByText(/42%/)).toBeVisible();
    expect(await findByText(/Test Scorecard 1/)).toBeVisible();
    expect(await findByText(/15%/)).toBeVisible();
    expect(await findByText(/Test Scorecard 2/)).toBeVisible();
    expect(await findByText(/50%/)).toBeVisible();
    expect(await findByText(/Basic Scorecard/)).toBeVisible();
    expect(await findByText(/75%/)).toBeVisible();
    expect(await findByText(/Migration/)).toBeVisible();

    expect(await queryByText(/100%/)).not.toBeInTheDocument();
    expect(await queryByText(/Test Scorecard 3/)).not.toBeInTheDocument();
  });
});
