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
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { TestApiProvider, wrapInTestApp } from '@backstage/test-utils';
import { render } from '@testing-library/react';
import React from 'react';

import { cortexApiRef } from '../../../api';
import { CortexApi } from '../../../api/CortexApi';
import { extensionApiRef } from '../../../api/ExtensionApi';
import { rootRouteRef } from '../../../routes';
import { Fixtures } from '../../../utils/TestUtils';
import InitiativeDetailsPage from './InitiativeDetailsPage';
import { CompoundFilter, FilterType, Initiative } from '../../../api/types';

type AnyFunction = (args?: [] | [any]) => any;
type ApiOverrides = Record<string, AnyFunction>;

describe('Initiative Details Page', () => {
  const getCortexApi = (overrides?: ApiOverrides): Partial<CortexApi> => ({
    getInitiative: async () => Fixtures.initiativeWithScores(),
    getInitiativeActionItems: async () => [],
    ...overrides,
  });

  const renderInitiativeDetailsPage = (overrides?: ApiOverrides) =>
    render(
      wrapInTestApp(
        <TestApiProvider
          apis={[
            [cortexApiRef, getCortexApi(overrides)],
            [catalogApiRef, {}],
            [extensionApiRef, {}],
          ]}
        >
          <InitiativeDetailsPage />
        </TestApiProvider>,
        {
          mountedRoutes: {
            '/': rootRouteRef as any,
          },
        },
      ),
    );

  it('should render', async () => {
    // GIVEN
    const name = 'Test Initiative Name';
    // WHEN
    const { findByText } = renderInitiativeDetailsPage({
      getInitiative: async () =>
        Fixtures.initiativeWithScores({
          name,
          targetDate: '2026-06-06T06:00:00',
        }),
    });
    // THEN
    expect(await findByText(name)).toBeVisible();
    expect(await findByText(/Due by June 6th, 2026/)).toBeVisible();
  });

  describe('group filter text in metadata', () => {
    const renderWithFilter = (filter: Initiative['filter']) => {
      return renderInitiativeDetailsPage({
        getInitiative: async () => Fixtures.initiativeWithScores({ filter }),
      });
    };

    it('should handle no filter', async () => {
      // GIVEN
      const filter = undefined;
      // WHEN
      const { findByText } = renderWithFilter(filter);
      // THEN
      expect(await findByText(/Applies to all services/)).toBeVisible();
    });

    it('should handle single group', async () => {
      // GIVEN
      const filter: CompoundFilter = {
        entityGroupFilter: {
          entityGroups: ['test:group'],
          excludedEntityGroups: [],
        },
        type: FilterType.COMPOUND_FILTER,
      };
      // WHEN
      const { findByText } = renderWithFilter(filter);
      // THEN
      expect(
        await findByText(/Applies to services in group test:group/),
      ).toBeVisible();
    });

    it('should handle two groups', async () => {
      // GIVEN
      const filter: CompoundFilter = {
        entityGroupFilter: {
          entityGroups: ['test:group:1', 'test:group:2'],
          excludedEntityGroups: [],
        },
        type: FilterType.COMPOUND_FILTER,
      };
      // WHEN
      const { findByText } = renderWithFilter(filter);
      // THEN
      expect(
        await findByText(
          /Applies to services in groups test:group:1 and test:group:2/,
        ),
      ).toBeVisible();
    });

    it('should handle three groups', async () => {
      // GIVEN
      const filter: CompoundFilter = {
        entityGroupFilter: {
          entityGroups: ['test:group:1', 'test:group:2', 'test:group:3'],
          excludedEntityGroups: [],
        },
        type: FilterType.COMPOUND_FILTER,
      };
      // WHEN
      const { findByText } = renderWithFilter(filter);
      // THEN
      expect(
        await findByText(
          /Applies to services in groups test:group:1, test:group:2, and test:group:3/,
        ),
      ).toBeVisible();
    });

    it('should handle excluded groups', async () => {
      // GIVEN
      const filter: CompoundFilter = {
        entityGroupFilter: {
          entityGroups: [],
          excludedEntityGroups: ['test:group:1'],
        },
        type: FilterType.COMPOUND_FILTER,
      };
      // WHEN
      const { findByText } = renderWithFilter(filter);
      // THEN
      expect(
        await findByText(
          /Applies to services in all groups, excluding test:group:1/,
        ),
      ).toBeVisible();
    });
  });
});
