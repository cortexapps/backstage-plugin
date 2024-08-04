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
import { CortexApi } from '../../api/CortexApi';
import { Fixtures, renderWrapped } from '../../utils/TestUtils';
import {
  GroupByOption,
  ScorecardServiceScore,
  ScoresByIdentifier,
} from '../../api/types';
import {
  ExtensionApi,
  UiExtensions,
} from '@cortexapps/backstage-plugin-extensions';
import { SystemPage } from './SystemPage';
import { extensionApiRef } from '../../api/ExtensionApi';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { SystemEntity } from '@backstage/catalog-model';
import { rootRouteRef, scorecardRouteRef } from '../../routes';

describe('<SystemPage />', () => {
  const systemEntity: SystemEntity = {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'System',
    metadata: {
      name: 'system1',
    },
    spec: {
      owner: 'owner',
    },
  };

  it('should respect custom scorecard sort order', async () => {
    const cortexApi: Partial<CortexApi> = {
      getScorecards: () => {
        return Promise.resolve([
          Fixtures.scorecard({ name: 'Test Scorecard 1', id: 1 }),
          Fixtures.scorecard({ name: 'Test Scorecard 2', id: 2 }),
        ]);
      },

      getScorecardScores(
        _scorecardId: number,
      ): Promise<ScorecardServiceScore[]> {
        return Promise.resolve([]);
      },

      getServiceScorecardScores(
        _groupBy: GroupByOption,
      ): Promise<ScoresByIdentifier[]> {
        return Promise.resolve([
          {
            identifier: 'system:system1',
            scores: [
              {
                scorePercentage: 0.5,
                scorecardId: 1,
                scorecardName: 'Test Scorecard 1',
              },
              {
                scorePercentage: 0.5,
                scorecardId: 2,
                scorecardName: 'Test Scorecard 2',
              },
            ],
            numberOfServices: 4,
          },
        ]);
      },
    };

    const extensionApi: ExtensionApi = {
      getUiExtensions(): Promise<UiExtensions> {
        return Promise.resolve({
          scorecards: {
            sortOrder: {
              compareFn: (a, b) => -1 * a.name.localeCompare(b.name),
            },
          },
        });
      },
    };

    const { findByText } = renderWrapped(
      <EntityProvider entity={systemEntity}>
        <SystemPage />
      </EntityProvider>,
      cortexApi,
      {
        '/': rootRouteRef,
        '/scorecards/:id': scorecardRouteRef as any,
      },
      [extensionApiRef, extensionApi],
    );

    const scorecard1 = await findByText('Test Scorecard 1');
    const scorecard2 = await findByText('Test Scorecard 2');
    expect(scorecard1).toBeVisible();
    expect(scorecard2).toBeVisible();

    expect(scorecard2.compareDocumentPosition(scorecard1)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });
});
