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

import { CortexApi } from '../../api/CortexApi';
import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { TestApiProvider, wrapInTestApp } from '@backstage/test-utils';
import { cortexApiRef } from '../../api';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { initiativeRouteRef, rootRouteRef } from '../../routes';
import { CortexTeamActionItemsWidget } from './CortexTeamActionItemsWidget';

describe('<CortexTeamActionItemsWidget/>', () => {
  const entity = {
    apiVersion: 'v1',
    kind: 'Group',
    metadata: {
      name: 'ExampleGroup',
    },
    spec: {
      type: 'group',
    },
  };

  const cortexApi: Partial<CortexApi> = {
    getInitiativeActionItemsForTeam: () =>
      Promise.resolve([
        {
          rule: {
            id: 1,
            expression: 'git != null',
            weight: 1,
          },
          componentRef: 'component1',
          initiative: {
            initiativeId: 1,
            name: 'Basic service catalog',
            targetDate: '01/01/2000',
          },
        },
        {
          rule: {
            id: 1,
            expression: 'git != null',
            weight: 1,
          },
          componentRef: 'component1',
          initiative: {
            initiativeId: 2,
            name: 'Git initiative',
            targetDate: '05/05/2000',
          },
        },
        {
          rule: {
            id: 2,
            expression: 'description != null',
            weight: 1,
          },
          componentRef: 'component1',
          initiative: {
            initiativeId: 1,
            name: 'Basic service catalog',
            targetDate: '01/01/2000',
          },
        },
        {
          rule: {
            id: 2,
            expression: 'description != null',
            weight: 1,
          },
          componentRef: 'component2',
          initiative: {
            initiativeId: 1,
            name: 'Basic service catalog',
            targetDate: '01/01/2000',
          },
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
            '/': rootRouteRef as any, // TODO
            'initiatives/1': initiativeRouteRef as any, // TODO
            '/initiatives/2': initiativeRouteRef as any, // TODO
          },
        },
      ),
    );

  it('Properly renders CortexTeamActionItemsWidget', async () => {
    const { findByText, queryByText, queryAllByText, queryByLabelText } =
      renderWrapped(<CortexTeamActionItemsWidget />);
    expect(await findByText(/component1/)).toBeInTheDocument();
    expect(await findByText(/git != null/)).toBeInTheDocument();
    expect(queryAllByText(/description != null/)).toHaveLength(2);
    expect(await findByText(/component2/)).toBeInTheDocument();
    expect(queryByText(/Basic service catalog/)).not.toBeInTheDocument();
    expect(queryByText(/01\/01\/2000/)).not.toBeInTheDocument();
    expect(queryByText(/Git initiative/)).not.toBeInTheDocument();
    expect(queryByText(/05\/05\/2000/)).not.toBeInTheDocument();

    fireEvent.click(queryByLabelText('Show initiatives for git != null')!!);
    expect(await findByText(/Basic service catalog/)).toBeInTheDocument();
    expect(await findByText(/01\/01\/2000/)).toBeInTheDocument();
    expect(await findByText(/Git initiative/)).toBeInTheDocument();
    expect(await findByText(/05\/05\/2000/)).toBeInTheDocument();

    fireEvent.click(queryByLabelText('Show initiatives for git != null')!!); // TODO this doesn't work
    expect(queryByText(/Basic service catalog/)).not.toBeInTheDocument();
    expect(queryByText(/01\/01\/2000/)).not.toBeInTheDocument();
    expect(queryByText(/Git initiative/)).not.toBeInTheDocument();
    expect(queryByText(/05\/05\/2000/)).not.toBeInTheDocument();

    fireEvent.click(
      queryByLabelText('Show initiatives for description != null')!!,
    );
    expect(await findByText(/Basic service catalog/)).toBeInTheDocument();
    expect(await findByText(/01\/01\/2000/)).toBeInTheDocument();
    expect(queryByText(/Git initiative/)).not.toBeInTheDocument();
    expect(queryByText(/05\/05\/2000/)).not.toBeInTheDocument();
  });
});
