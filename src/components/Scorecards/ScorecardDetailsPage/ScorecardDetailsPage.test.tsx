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
import { fireEvent, screen } from '@testing-library/react';
import { ScorecardDetailsPage } from './ScorecardDetailsPage';
import { Fixtures, renderWrapped } from '../../../utils/TestUtils';
import { CortexApi } from '../../../api/CortexApi';
import {
  RuleOutcomeType,
  Scorecard,
  ScorecardLadder,
  ScorecardServiceScore,
} from '../../../api/types';
import { rootRouteRef, scorecardRouteRef } from '../../../routes';
import { CatalogApi, catalogApiRef } from '@backstage/plugin-catalog-react';
import {
  CustomMapping,
  ExtensionApi,
} from '@cortexapps/backstage-plugin-extensions';
import { EntityFilterGroup } from '../../../filters';
import { extensionApiRef } from '../../../api/ExtensionApi';
import { act } from 'react-dom/test-utils';

describe('ScorecardDetailsPage', () => {
  const emptyExtensionApi: ExtensionApi = {
    async getAdditionalFilters(): Promise<EntityFilterGroup[]> {
      return [];
    },

    async getCustomMappings(): Promise<CustomMapping[]> {
      return [];
    },
  };

  const gitRule = {
    id: 1,
    expression: 'git != null',
    weight: 1,
  };
  const docsRule = {
    id: 2,
    expression: 'documentation.count > 0',
    weight: 1,
  };
  const oncallRule = {
    id: 3,
    expression: 'oncall != null',
    weight: 1,
  };
  const descriptionRule = {
    id: 4,
    expression: 'description != null',
    weight: 1,
  };
  const k8sRule = {
    id: 5,
    expression: 'k8s != null',
    weight: 1,
  };
  const customRule = {
    id: 6,
    expression: 'custom("my_key") != null',
    weight: 1,
  };

  const cortexApi: Partial<CortexApi> = {
    async getScorecard(_: number): Promise<Scorecard | undefined> {
      return Fixtures.scorecard();
    },

    async getScorecardLadders(_: number): Promise<ScorecardLadder[]> {
      return [];
    },

    async getScorecardScores(_: number): Promise<ScorecardServiceScore[]> {
      return [
        Fixtures.scorecardServiceScore({
          componentRef: 'foo',
          scorePercentage: 0.5,
        }),
        Fixtures.scorecardServiceScore({
          componentRef: 'bar',
          scorePercentage: 0.7,
        }),
      ];
    },
  };

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
            ],
          }),
          Fixtures.entity({
            kind: 'Component',
            metadata: Fixtures.entityMeta({ name: 'bar' }),
            relations: [
              { type: 'ownedBy', targetRef: 'Group:alsomine' },
              { type: 'ownedBy', targetRef: 'Group:shared' },
            ],
          }),
        ],
      };
    },
  };

  function render(cortexApiOverride: Partial<CortexApi> = cortexApi) {
    return renderWrapped(
      <ScorecardDetailsPage />,
      cortexApiOverride,
      {
        '/': rootRouteRef,
        '/scorecards/:id': scorecardRouteRef as any,
      },
      [catalogApiRef, catalogApi],
      [extensionApiRef, emptyExtensionApi],
    );
  }

  it('should render all service scores', async () => {
    const { findByText, findAllByText } = render();
    expect(await findByText('foo')).toBeVisible();
    expect(await findAllByText('50%')).not.toBe([]);

    expect(await findByText('bar')).toBeVisible();
    expect(await findAllByText('70%')).not.toBe([]);
  });

  it('should filter by group', async () => {
    const { clickButton, checkForText, checkNotText } = render();
    await checkForText('foo');
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

  it('filtering changes scores and services being shown', async () => {
    const mockCortexApi: Partial<CortexApi> = { ...cortexApi };
    mockCortexApi.getScorecard = async (
      _: number,
    ): Promise<Scorecard | undefined> => {
      return Fixtures.scorecard({
        rules: [
          gitRule,
          docsRule,
          oncallRule,
          descriptionRule,
          k8sRule,
          customRule,
        ],
      });
    };
    mockCortexApi.getScorecardScores = async (
      _: number,
    ): Promise<ScorecardServiceScore[]> => {
      return [
        Fixtures.scorecardServiceScore({
          componentRef: 'foo',
          score: 4,
          scorePercentage: 1,
          rules: [
            {
              rule: gitRule,
              score: 1,
              type: RuleOutcomeType.APPLICABLE,
            },
            {
              rule: docsRule,
              score: 1,
              type: RuleOutcomeType.APPLICABLE,
            },
            {
              rule: oncallRule,
              score: 1,
              type: RuleOutcomeType.APPLICABLE,
            },
            {
              rule: descriptionRule,
              score: 1,
              type: RuleOutcomeType.APPLICABLE,
            },
            {
              rule: k8sRule,
              requestedDate: '05/05/2000',
              approvedDate: '05/05/2000',
              type: RuleOutcomeType.NOT_APPLICABLE,
            },
            {
              rule: customRule,
              type: RuleOutcomeType.NOT_EVALUATED,
            },
          ],
        }),
        Fixtures.scorecardServiceScore({
          serviceId: 2,
          componentRef: 'bar',
          score: 3,
          scorePercentage: 0.75,
          rules: [
            {
              rule: gitRule,
              score: 1,
              type: RuleOutcomeType.APPLICABLE,
            },
            {
              rule: docsRule,
              score: 1,
              type: RuleOutcomeType.APPLICABLE,
            },
            {
              rule: oncallRule,
              score: 1,
              type: RuleOutcomeType.APPLICABLE,
            },
            {
              rule: descriptionRule,
              score: 0,
              type: RuleOutcomeType.APPLICABLE,
            },
            {
              rule: k8sRule,
              type: RuleOutcomeType.NOT_EVALUATED,
            },
            {
              rule: customRule,
              type: RuleOutcomeType.NOT_EVALUATED,
            },
          ],
        }),
        Fixtures.scorecardServiceScore({
          serviceId: 3,
          componentRef: 'lorem',
          score: 2,
          scorePercentage: 0.5,
          rules: [
            {
              rule: gitRule,
              score: 1,
              type: RuleOutcomeType.APPLICABLE,
            },
            {
              rule: docsRule,
              score: 1,
              type: RuleOutcomeType.APPLICABLE,
            },
            {
              rule: oncallRule,
              score: 0,
              type: RuleOutcomeType.APPLICABLE,
            },
            {
              rule: descriptionRule,
              score: 0,
              type: RuleOutcomeType.APPLICABLE,
            },
            {
              rule: k8sRule,
              type: RuleOutcomeType.NOT_EVALUATED,
            },
            {
              rule: customRule,
              type: RuleOutcomeType.NOT_EVALUATED,
            },
          ],
        }),
        Fixtures.scorecardServiceScore({
          serviceId: 4,
          componentRef: 'ipsum',
          score: 1,
          scorePercentage: 0.25,
          rules: [
            {
              rule: gitRule,
              score: 1,
              type: RuleOutcomeType.APPLICABLE,
            },
            {
              rule: docsRule,
              score: 0,
              type: RuleOutcomeType.APPLICABLE,
            },
            {
              rule: oncallRule,
              score: 0,
              type: RuleOutcomeType.APPLICABLE,
            },
            {
              rule: descriptionRule,
              score: 0,
              type: RuleOutcomeType.APPLICABLE,
            },
            {
              rule: k8sRule,
              type: RuleOutcomeType.NOT_EVALUATED,
            },
            {
              rule: customRule,
              type: RuleOutcomeType.NOT_EVALUATED,
            },
          ],
        }),
      ];
    };
    const { checkForText, checkNotText, clickButtonByMatcher } =
      render(mockCortexApi);

    await checkForText(/Failing Rule/);
    await checkNotText(/No scores found/);
    await checkForText(/63%/, 0); // average score of all 4 services

    await clickButtonByMatcher(/Filter failing rule by git/);
    await checkForText(/Failing Rule/);
    await checkNotText(/63%/);
    await checkForText(/No scores found/);

    await clickButtonByMatcher(/Filter failing rule by oncall/);
    await checkForText(/Failing Rule/);
    await checkNotText(/63%/);
    await checkForText(/38%/, 0); // average score of 2 services fulfilling the filter
    await checkForText(/lorem/);
    await checkForText(/ipsum/);
    await checkNotText(/foo/);

    // Clear the filters for failed rule and check exempt rules
    await clickButtonByMatcher(/Filter failing rule by git/);
    await clickButtonByMatcher(/Filter failing rule by oncall/);
    await clickButtonByMatcher(/Filter exempt rule by k8s/);
    await checkForText(/Exempt Rule/);
    await checkNotText(/38%/);
    await checkForText(/100%/, 0); // average score of 1 service fulfilling the filter
    await checkForText(/foo/);
    await checkNotText(/lorem/);
    await checkNotText(/ipsum/);
  });

  it('can filter when there are a large number of rules', async () => {
    const mockCortexApi: Partial<CortexApi> = { ...cortexApi };
    mockCortexApi.getScorecard = async (
      _: number,
    ): Promise<Scorecard | undefined> => {
      return Fixtures.scorecard({
        rules: [
          {
            id: 1,
            expression: 'git.enabled',
            description: 'Has Git',
            weight: 10,
          },
          {
            id: 2,
            expression: 'runbooks.count > 0',
            description: 'My Rule',
            weight: 10,
          },
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
    const { checkForText, clickButton } = render(mockCortexApi);

    await checkForText(/Failing Rule/);
    await clickButton('Filter failing rule');
    const dropdownOption = await screen.findByText(/documentation.count/, {
      selector: 'li',
    });
    await screen.findByText(/custom\("cow"\).length/, { selector: 'li' });
    await act(async () => {
      fireEvent.click(dropdownOption);
    });

    await checkForText(/Failing Rule/);
    expect(
      await screen.queryByText(/custom\("cow"\).length/, { selector: 'li' }),
    ).not.toBeInTheDocument();
  });

  // MUI select is broken in a weird way, can't test
  it.skip('should filter with any of / all of working correctly', async () => {
    const {
      mouseClick,
      clickButton,
      clickButtonByText,
      checkForText,
      checkNotText,
    } = render();

    await clickButton('Filter groups by mine');
    await clickButton('Filter groups by alsomine');
    await checkForText('foo');
    await checkForText('bar');

    await mouseClick('Select and/or for groups');
    await clickButtonByText('All Of');
    await checkNotText('foo');
    await checkNotText('bar');
  });
});
