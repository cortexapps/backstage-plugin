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
import {ScorecardDetailsPage} from "./ScorecardDetailsPage";
import {Fixtures, renderWrapped} from "../../../utils/TestUtils";
import {CortexApi} from "../../../api/CortexApi";
import {Scorecard, ScorecardLadder, ScorecardServiceScore} from "../../../api/types";
import {rootRouteRef, scorecardRouteRef} from "../../../routes";
import {CatalogApi, catalogApiRef} from "@backstage/plugin-catalog-react";
import {CustomMapping, ExtensionApi} from "@cortexapps/backstage-plugin-extensions";
import {EntityFilterGroup} from "../../../filters";
import {extensionApiRef} from "../../../api/ExtensionApi";

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
          componentRef: 'default/bar',
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

  function render() {
   return renderWrapped(<ScorecardDetailsPage />, {
     '/': rootRouteRef,
     '/scorecards/:id': scorecardRouteRef as any,
   }, cortexApi,[catalogApiRef, catalogApi], [extensionApiRef, emptyExtensionApi]);
  }


  it('should be render all service scores', async () => {
    const { findByText, findAllByText } = render()
    expect(await findByText('foo')).toBeVisible();
    expect(await findAllByText('50%')).not.toBe([]);

    expect(await findByText('bar')).toBeVisible();
    expect(await findAllByText('70%')).not.toBe([]);
  });

  it('should filter by group', async () => {
    const { findByText, clickButton, logScreen } = render()
    expect(await findByText('foo')).toBeVisible();
    expect(await findByText('bar')).toBeVisible();

    // logScreen()
    await clickButton('Filter by mine')
    logScreen()
    expect(await findByText('foo')).toBeVisible();
    expect(await findByText('bar')).not.toBeVisible();
    await clickButton('Filter by mine');

    await clickButton('Filter by shared')
    expect(await findByText('foo')).toBeVisible();
    expect(await findByText('bar')).toBeVisible();
    await clickButton('Filter by shared')

    await clickButton('Filter by alsomine')
    expect(await findByText('foo')).not.toBeVisible();
    expect(await findByText('bar')).toBeVisible();
    await clickButton('Filter by alsomine')
  });
});

