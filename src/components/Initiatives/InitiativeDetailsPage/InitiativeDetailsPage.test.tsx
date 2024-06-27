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
import { act, fireEvent, render, waitFor } from '@testing-library/react';
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
    getCatalogEntities: async () => {
      return {
        entities: [
          {
            codeTag: 'entity-1',
            groupNames: [],
            id: 234,
            name: 'Entity 1',
            serviceGroupTags: [],
            serviceOwnerEmails: [],
            type: 'service',
          },
        ],
      };
    },
    getInitiative: async () => Fixtures.initiativeWithScores(),
    getInitiativeActionItems: async () => [],
    getUserEntities: async () => ({ entityIds: [] }),
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

    it('resets filter values to applied when closing and reopening the modal', async () => {
      // GIVEN
      const initiativeWithScores = Fixtures.initiativeWithScores();
      initiativeWithScores.scores = [
        {
          scorePercentage: 0.5,
          entityTag: 'entity-1',
        },
      ];
      initiativeWithScores.rules = [
        {
          ruleId: 88,
          expression: 'git != null',
          title: 'has git',
        },
      ];
      const { findByLabelText, getByLabelText, getByText, queryByText } =
        renderInitiativeDetailsPage({
          getInitiativeActionItems: async () => {
            return [
              {
                rule: {
                  expression: 'git != null',
                  name: 'has git',
                  id: 12,
                  weight: 1,
                },
                componentRef: 'entity-1',
                initiative: {
                  initiativeId: 1,
                  name: 'Test Initiative Name',
                  targetDate: '2026-06-06T06:00:00',
                },
              },
            ];
          },
          getInitiative: async () => initiativeWithScores,
        });
      // WHEN
      const filterButton = await findByLabelText('Filter');
      await filterButton.click();

      await waitFor(() => {
        expect(getByText('Apply filters')).toBeVisible();
      });

      const passingInput = getByLabelText('Filter passing rules by has git');

      expect(passingInput).not.toBeChecked();

      await fireEvent.click(passingInput);
      expect(passingInput).toBeChecked();

      // close the modal -- couldn't come up with a less hacky version that worked :(
      const backdrop = document.body.querySelector('.MuiBackdrop-root');
      fireEvent.click(backdrop!);

      await waitFor(() => {
        expect(queryByText('Filter Initiative')).not.toBeInTheDocument();
      });

      // re-open modal
      filterButton.click();
      await waitFor(() => {
        expect(getByText('Filter Initiative')).toBeVisible();
      });

      // THEN
      const newPassingInput = getByLabelText('Filter passing rules by has git');
      expect(newPassingInput).not.toBeChecked();
    });
  });

  it('allows filtering be "my entities"', async () => {
    const initiativeWithScores = Fixtures.initiativeWithScores();
    initiativeWithScores.scores = [
      {
        scorePercentage: 0.5,
        entityTag: 'entity-1',
      },
      {
        scorePercentage: 0.5,
        entityTag: 'entity-2',
      },
    ];
    initiativeWithScores.rules = [
      {
        ruleId: 88,
        expression: 'git != null',
        title: 'has git',
      },
      {
        ruleId: 89,
        expression: 'jira != null',
        title: 'has jira',
      },
    ];

    const { findByText, findByLabelText, getByLabelText, queryByText } =
      renderInitiativeDetailsPage({
        getCatalogEntities: async () => {
          return {
            entities: [
              {
                codeTag: 'entity-1',
                groupNames: [],
                id: 234,
                name: 'Entity 1',
                serviceGroupTags: [],
                serviceOwnerEmails: [],
                type: 'service',
              },
              {
                codeTag: 'entity-2',
                groupNames: [],
                id: 235,
                name: 'Entity 2',
                serviceGroupTags: [],
                serviceOwnerEmails: [],
                type: 'service',
              },
            ],
          };
        },
        getUserEntities: async () => ({ entityIds: [234] }),
        getInitiativeActionItems: async () => {
          const initiativeItem = {
            initiativeId: 1,
            name: 'Test Initiative Name',
            targetDate: '2026-06-06T06:00:00',
          };

          const rule1 = {
            expression: 'git != null',
            name: 'has git',
            id: 12,
            weight: 1,
          };

          const rule2 = {
            expression: 'jira != null',
            name: 'has jira',
            id: 12,
            weight: 1,
          };

          return [
            {
              rule: rule1,
              componentRef: 'entity-1',
              initiative: initiativeItem,
            },
            {
              rule: rule2,
              componentRef: 'entity-1',
              initiative: initiativeItem,
            },
            {
              rule: rule1,
              componentRef: 'entity-2',
              initiative: initiativeItem,
            },
            {
              rule: rule2,
              componentRef: 'entity-2',
              initiative: initiativeItem,
            },
          ];
        },
        getInitiative: async () => initiativeWithScores,
      });

    expect(await findByText('Entity 1')).toBeVisible();
    expect(await findByText('Entity 2')).toBeVisible();

    // WHEN
    const filterButton = await findByLabelText('Filter');
    act(async () => {
      filterButton.click();
    });

    const applyFiltersButton = await findByLabelText('Apply filters');
    await waitFor(() => {
      expect(applyFiltersButton).toBeVisible();
    });

    const myEntitiesInput = getByLabelText('Filter myentities by My entities');

    expect(myEntitiesInput).not.toBeChecked();

    act(async () => {
      fireEvent.click(myEntitiesInput);
    });

    expect(myEntitiesInput).toBeChecked();

    act(async () => {
      fireEvent.click(applyFiltersButton);
    });

    await waitFor(() => {
      expect(queryByText('Entity 2')).not.toBeInTheDocument();
    });
  });
});
