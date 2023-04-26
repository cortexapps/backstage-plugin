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
import { CortexApi } from '../../../api/CortexApi';
import React from 'react';
import { ScorecardsPage } from './ScorecardsPage';
import { Fixtures, renderWrapped } from '../../../utils/TestUtils';
import { extensionApiRef } from '../../../api/ExtensionApi';
import { rootRouteRef } from '../../../routes';
import { Scorecard } from '../../../api/types';
import {
  ExtensionApi,
  UiExtensions,
} from '@cortexapps/backstage-plugin-extensions';

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

  it('should render', async () => {
    const { findByText } = renderWrapped(
      <ScorecardsPage />,
      getCortexApi(),
      { '/': rootRouteRef as any },
      [extensionApiRef, {}],
    );
    expect(await findByText(/My Scorecard/)).toBeVisible();
    expect(await findByText(/Some description/)).toBeVisible();
  });

  it('should render empty state if no scorecards', async () => {
    const emptyGetScorecards = () => Promise.resolve([]);
    const { findByText } = renderWrapped(
      <ScorecardsPage />,
      getCortexApi({ getScorecards: emptyGetScorecards }),
      { '/': rootRouteRef as any },
      [extensionApiRef, {}],
    );
    expect(await findByText(/No scorecards to display/)).toBeVisible();
    expect(
      await findByText(/You haven't added any scorecards yet/),
    ).toBeVisible();
  });

  it('should respect custom scorecard sort order', async () => {
    const cortexApi: Partial<CortexApi> = {
      getScorecards(): Promise<Scorecard[]> {
        return Promise.resolve([
          Fixtures.scorecard({ id: 1, name: 'Test Scorecard 1' }),
          Fixtures.scorecard({ id: 2, name: 'Test Scorecard 2' }),
        ]);
      },
    };

    const extensionApi: ExtensionApi = {
      getUiExtensions(): Promise<UiExtensions> {
        return Promise.resolve({
          scorecards: {
            sortOrder: {
              // Reverse aphabetically, which is opposite of default sort order
              compareFn: (a, b) => -1 * a.name.localeCompare(b.name),
            },
          },
        });
      },
    };

    const { findByText } = renderWrapped(
      <ScorecardsPage />,
      cortexApi,
      { '/': rootRouteRef as any },
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
