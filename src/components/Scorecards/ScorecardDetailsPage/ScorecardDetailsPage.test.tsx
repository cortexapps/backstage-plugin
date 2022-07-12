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
import { fireEvent, screen } from '@testing-library/react';
import { ScorecardDetailsPage } from "./ScorecardDetailsPage";
import { Fixtures, renderWrapped } from "../../../utils/TestUtils";
import { CortexApi } from "../../../api/CortexApi";
import { Scorecard, ScorecardLadder, ScorecardServiceScore } from "../../../api/types";
import { rootRouteRef, scorecardRouteRef } from "../../../routes";
import { CatalogApi, catalogApiRef } from "@backstage/plugin-catalog-react";
import { CustomMapping, ExtensionApi } from "@cortexapps/backstage-plugin-extensions";
import { EntityFilterGroup } from "../../../filters";
import { extensionApiRef } from "../../../api/ExtensionApi";
import { act } from 'react-dom/test-utils';

describe('ScorecardDetailsPage', () => {

  const emptyExtensionApi: ExtensionApi = {
    async getAdditionalFilters(): Promise<EntityFilterGroup[]> {
      return []
    },

    async getCustomMappings(): Promise<CustomMapping[]> {
      return []
    }
  }

  const cortexApi: Partial<CortexApi> = {
    async getScorecard(_: number): Promise<Scorecard | undefined> {
      return Fixtures.scorecard()
    },

    async getScorecardLadders(_: number): Promise<ScorecardLadder[]> {
      return []
    },

    async getScorecardScores(_: number): Promise<ScorecardServiceScore[]> {
      return [
        Fixtures.scorecardServiceScore({
          componentRef: 'foo',
          scorePercentage: 0.5
        }),
        Fixtures.scorecardServiceScore({
          componentRef: 'bar',
          scorePercentage: 0.7
        }),
      ]
    },
  }

  const catalogApi: Partial<CatalogApi> = {
    async getEntities(_) {
      return {
        items: [
          Fixtures.entity({
            kind: 'Component',
            metadata: Fixtures.entityMeta({ name: 'foo' }),
            relations: [
              { type: 'ownedBy', targetRef: 'Group:shared' },
              { type: 'ownedBy', targetRef: 'Group:mine' },
            ]
          }),
          Fixtures.entity({
            kind: 'Component',
            metadata: Fixtures.entityMeta({ name: 'bar' }),
            relations: [
              { type: 'ownedBy', targetRef: 'Group:alsomine' },
              { type: 'ownedBy', targetRef: 'Group:shared' },
            ]
          }),
        ]
      }
    }
  }

  function render(cortexApiOverride: Partial<CortexApi> = cortexApi) {
    return renderWrapped(<ScorecardDetailsPage />, cortexApiOverride, {
      '/': rootRouteRef,
      '/scorecards/:id': scorecardRouteRef as any,
    }, [catalogApiRef, catalogApi], [extensionApiRef, emptyExtensionApi]);
  }


  it('should render all service scores', async () => {
    const { findByText, findAllByText } = render()
    expect(await findByText('foo')).toBeVisible();
    expect(await findAllByText('50%')).not.toBe([]);

    expect(await findByText('bar')).toBeVisible();
    expect(await findAllByText('70%')).not.toBe([]);
  });

  it('should filter by group', async () => {
    const { clickButton, checkForText, checkNotText } = render()
    await checkForText('foo')
    await checkForText('bar');

    await clickButton('Filter groups by mine');
    await checkForText('foo');
    await checkNotText('bar');
    await clickButton('Filter groups by mine');

    await clickButton('Filter groups by shared');
    await checkForText('foo');
    await checkForText('bar');
    await clickButton('Filter groups by shared');

    await clickButton('Filter groups by alsomine');
    await checkNotText('foo');
    await checkForText('bar');
    await clickButton('Filter groups by alsomine');
  });

  it('can filter when there are a large number of rules', async () => {
    const mockCortexApi: Partial<CortexApi> = { ...cortexApi };
    mockCortexApi.getScorecard = async (_: number): Promise<Scorecard | undefined> => {
      return Fixtures.scorecard({
        rules: [
          { id: 1, expression: 'git.enabled', description: 'Has Git', weight: 10 },
          { id: 2, expression: 'runbooks.count > 0', description: 'My Rule', weight: 10 },
          { id: 3, expression: 'documentation.count > 0', weight: 20 },
          { id: 4, expression: 'custom("foo").length > 1', weight: 20 },
          { id: 5, expression: 'custom("bar").length > 6', weight: 5 },
          { id: 6, expression: 'custom("baz").length > 3', weight: 5 },
          { id: 7, expression: 'custom("custom").length > 4', weight: 5 },
          { id: 8, expression: 'custom("cow").length > 8', weight: 5 },
          { id: 9, expression: 'custom("length").length > 9', weight: 5 },
          { id: 10, expression: 'custom("cortex").length > 10', weight: 5 },
          { id: 11, expression: 'custom("xyz").length > 2', weight: 1 },
        ],
      });
    };
    // For some reason, checks would never fail if I used the methods returned
    // by `render()` so I had to use `screen.*` methods directly here
    render(mockCortexApi);

    expect(await screen.findByText(/Failing Rule/)).toBeVisible();
    fireEvent.click(await screen.findByLabelText(/Filter failing rule/));

    const dropdownOption = await screen.findByText(/documentation.count/, { selector: 'li' });
    await screen.findByText(/custom\("cow"\).length/, { selector: 'li' });
    act(async () => {
      fireEvent.click(dropdownOption);
    });

    expect(await screen.findByText(/Failing Rule/)).toBeVisible();
    expect(await screen.queryByText(/custom\("cow"\).length/, { selector: 'li' })).not.toBeInTheDocument();
  });

  // MUI select is broken in a weird way, can't test
  it.skip('should filter with any of / all of working correctly', async () => {
    const { mouseClick, clickButton, clickButtonByText, checkForText, checkNotText, logScreen } = render();

    await clickButton('Filter groups by mine');
    await clickButton('Filter groups by alsomine');
    await checkForText('foo');
    await checkForText('bar');

    await mouseClick('Select and/or for groups');
    logScreen();
    await clickButtonByText('All Of');
    await checkNotText('foo');
    await checkNotText('bar');
  });
});

