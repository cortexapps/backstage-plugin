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
import {
  act,
  fireEvent,
  render,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { TestApiProvider, wrapInTestApp } from '@backstage/test-utils';
import { cortexApiRef } from '../../api';
import {
  EntityProvider,
  entityRouteRef,
} from '@backstage/plugin-catalog-react';
import { initiativeRouteRef, rootRouteRef } from '../../routes';
import { CortexGroupActionItemsWidget } from './CortexGroupActionItemsWidget';

describe('<CortexGroupActionItemsWidget/>', () => {
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
            '/': rootRouteRef,
            '/entity/:namespace/:kind/:name': entityRouteRef,
            '/initiatives/:id': initiativeRouteRef as any,
          },
        },
      ),
    );

  it('Properly renders CortexGroupActionItemsWidget', async () => {
    const { findByText, queryByText, queryAllByText, queryByLabelText } =
      renderWrapped(<CortexGroupActionItemsWidget />);
    expect(await findByText(/component1/)).toBeVisible();
    expect(await findByText(/git != null/)).toBeVisible();
    expect(queryAllByText(/description != null/)).toHaveLength(2);
    expect(await findByText(/component2/)).toBeVisible();
    expect(queryByText(/Basic service catalog/)).not.toBeInTheDocument();
    expect(queryByText(/01\/01\/2000/)).not.toBeInTheDocument();
    expect(queryByText(/Git initiative/)).not.toBeInTheDocument();
    expect(queryByText(/05\/05\/2000/)).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.click(
        queryByLabelText(
          'Show initiatives for component1 with rule git != null',
        )!!,
      );
    });
    expect(await findByText(/Basic service catalog/)).toBeVisible();
    expect(await findByText(/01\/01\/2000/)).toBeVisible();
    expect(await findByText(/Git initiative/)).toBeVisible();
    expect(await findByText(/05\/05\/2000/)).toBeVisible();

    await act(async () => {
      fireEvent.click(
        queryByLabelText(
          'Show initiatives for component1 with rule git != null',
        )!!,
      );
    });
    // The animation takes some time so wait for the elements to be removed
    await waitForElementToBeRemoved(queryByText(/Basic service catalog/));
    expect(queryByText(/01\/01\/2000/)).not.toBeInTheDocument();
    expect(queryByText(/Git initiative/)).not.toBeInTheDocument();
    expect(queryByText(/05\/05\/2000/)).not.toBeInTheDocument();

    fireEvent.click(
      queryByLabelText(
        'Show initiatives for component2 with rule description != null',
      )!!,
    );
    expect(await findByText(/Basic service catalog/)).toBeVisible();
    expect(await findByText(/01\/01\/2000/)).toBeVisible();
    expect(queryByText(/Git initiative/)).not.toBeInTheDocument();
    expect(queryByText(/05\/05\/2000/)).not.toBeInTheDocument();
  });
});
