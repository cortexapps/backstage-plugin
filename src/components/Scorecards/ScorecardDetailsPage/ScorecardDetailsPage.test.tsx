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
import { fireEvent, screen } from '@testing-library/react';
import { ScorecardDetailsPage } from './ScorecardDetailsPage';
import { Fixtures, renderWrapped } from '../../../utils/TestUtils';
import { CortexApi } from '../../../api/CortexApi';
import {
  RuleOutcomeType,
  Scorecard,
  ScorecardLadder,
  ScorecardRuleExemptionResult,
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
import { HomepageEntityResponse } from '../../../api/userInsightTypes';

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
    cqlVersion: '1.0',
    expression: 'git != null',
    weight: 1,
  };
  const docsRule = {
    id: 2,
    cqlVersion: '1.0',
    expression: 'documentation.count > 0',
    weight: 1,
  };
  const oncallRule = {
    id: 3,
    cqlVersion: '1.0',
    expression: 'oncall != null',
    weight: 1,
  };
  const descriptionRule = {
    id: 4,
    cqlVersion: '1.0',
    expression: 'description != null',
    weight: 1,
  };
  const k8sRule = {
    id: 5,
    cqlVersion: '1.0',
    expression: 'k8s != null',
    weight: 1,
  };
  const customRule = {
    id: 6,
    cqlVersion: '1.0',
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
          componentRef: 'foo-tag',
          scorePercentage: 0.5,
        }),
        Fixtures.scorecardServiceScore({
          componentRef: 'bar-tag',
          scorePercentage: 0.7,
        }),
      ];
    },

    async getCatalogEntities(): Promise<HomepageEntityResponse> {
      return {
        entities: [
          {
            codeTag: 'foo-tag',
            groupNames: [],
            id: 1,
            name: 'foo',
            serviceGroupTags: [],
            serviceOwnerEmails: [],
            type: 'service',
          },
          {
            codeTag: 'bar-tag',
            groupNames: [],
            id: 2,
            name: 'bar',
            serviceGroupTags: [],
            serviceOwnerEmails: [],
            type: 'service',
          },
        ],
      };
    },

    async getScorecardRuleExemptions(): Promise<ScorecardRuleExemptionResult> {
      return { scorecardRuleExemptions: {} };
    },
  };

  const catalogApi: Partial<CatalogApi> = {
    async getEntities(_) {
      return {
        items: [
          Fixtures.entity({
            kind: 'Component',
            metadata: Fixtures.entityMeta({ name: 'foo-tag' }),
            relations: [
              { type: 'ownedBy', targetRef: 'Group:shared' },
              { type: 'ownedBy', targetRef: 'Group:mine' },
            ],
          }),
          Fixtures.entity({
            kind: 'Component',
            metadata: Fixtures.entityMeta({ name: 'bar-tag' }),
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
    const { clickButton, clickButtonByMatcher, checkForText, checkNotText } =
      render();

    await checkForText('foo');
    await checkForText('bar');

    await clickButton('Filter');
    await clickButtonByMatcher('mine');
    await clickButton('Apply filters');

    await checkForText('foo');
    await checkNotText('bar');

    await clickButton('Filter');
    await clickButtonByMatcher('mine');
    await clickButtonByMatcher('shared');
    await clickButton('Apply filters');

    await checkForText('foo');
    await checkForText('bar');

    await clickButton('Filter');
    await clickButtonByMatcher('shared');
    await clickButtonByMatcher('alsomine');
    await clickButton('Apply filters');

    await checkNotText('foo');
    await checkForText('bar');
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
          ladderLevels: [],
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
    mockCortexApi.getScorecardLadders = async (
      _: number,
    ): Promise<ScorecardLadder[]> => {
      return [
        {
          scorecardId: '1',
          name: 'my ladder',
          levels: [
            {
              id: '1',
              name: 'First',
              color: '#ff0000',
              rank: 1,
              rules: [],
            },
          ],
        } as ScorecardLadder,
      ];
    };
    const {
      clickButton,
      checkForText,
      checkNotText,
      clickButtonByMatcher,
      findByTestId,
    } = render(mockCortexApi);

    await checkForText('My Scorecard');
    await checkNotText(/No scores found/);

    expect((await findByTestId('Services')).textContent).toBe('4'); // Num of entities

    await clickButton('Filter');
    await clickButtonByMatcher(/Filter failing rules by git/);
    await clickButton('Apply filters');

    expect((await findByTestId('Services')).textContent).toBe('0'); // Num of entities
    await checkForText(/No scores found/);

    await clickButton('Filter');
    await clickButtonByMatcher(/Filter failing rules by git/);
    await clickButtonByMatcher(/Filter failing rules by oncall/);
    await clickButton('Apply filters');

    expect((await findByTestId('Services')).textContent).toBe('2'); // Num of entities
    await checkNotText(/No scores found/);
    await checkForText(/lorem/, 0);
    await checkForText(/ipsum/, 0);
    await checkNotText(/foo/);

    // Clear the filters for failed rule and check exempt rules
    await clickButton('Filter');
    await clickButtonByMatcher(/Filter failing rules by oncall/);
    await clickButtonByMatcher(/Filter exempt rules by k8s/);
    await clickButton('Apply filters');

    expect((await findByTestId('Services')).textContent).toBe('1'); // Num of entities
    await checkForText(/foo/, 0);
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
            cqlVersion: '1.0',
            expression: 'git.enabled',
            description: 'Has Git',
            weight: 10,
          },
          {
            id: 2,
            cqlVersion: '1.0',
            expression: 'runbooks.count > 0',
            description: 'My Rule',
            weight: 10,
          },
          { id: 3, cqlVersion: '1.0', expression: 'documentation.count > 0', weight: 20 },
          { id: 4, cqlVersion: '1.0', expression: 'custom("foo").length > 1', weight: 20 },
          { id: 5, cqlVersion: '1.0', expression: 'custom("bar").length > 6', weight: 5 },
          { id: 6, cqlVersion: '1.0', expression: 'custom("baz").length > 3', weight: 5 },
          { id: 7, cqlVersion: '1.0', expression: 'custom("custom").length > 4', weight: 5 },
          { id: 8, cqlVersion: '1.0', expression: 'custom("cow").length > 8', weight: 5 },
          { id: 9, cqlVersion: '1.0', expression: 'custom("length").length > 9', weight: 5 },
          { id: 10, cqlVersion: '1.0', expression: 'custom("cortex").length > 10', weight: 5 },
          { id: 11, cqlVersion: '1.0', expression: 'custom("xyz").length > 2', weight: 1 },
        ],
      });
    };
    const { checkForText, clickButton } = render(mockCortexApi);

    await clickButton('Filter');
    await checkForText(/Failing rules/);
    await clickButton('Filter failing rules');
    const dropdownOption = await screen.findByText(/documentation.count/, {
      selector: 'li',
    });
    await screen.findByText(/custom\("cow"\).length/, { selector: 'li' });
    await act(async () => {
      fireEvent.click(dropdownOption);
    });

    await checkForText(/Failing rules/);
    expect(
      await screen.queryByText(/custom\("cow"\).length/, { selector: 'li' }),
    ).not.toBeInTheDocument();
  });

  it('copies names, tags and scores as CSV on button click', async () => {
    const originalClipboard = navigator.clipboard;
    const mockedWriteText = jest.fn();

    Object.assign(navigator, {
      clipboard: {
        writeText: mockedWriteText,
      },
    });

    const { clickButtonByMatcher } = render();
    await clickButtonByMatcher(/Copy scores/);

    const expectedValue = 'Service,Score\nbar (bar-tag),70\nfoo (foo-tag),50';
    expect(mockedWriteText).toHaveBeenCalledTimes(1);
    expect(mockedWriteText).toHaveBeenCalledWith(expectedValue);

    Object.assign(navigator, {
      clipboard: originalClipboard,
    });
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
