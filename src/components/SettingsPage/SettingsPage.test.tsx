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
import { CortexApi } from '../../api/CortexApi';
import React from 'react';
import { CatalogApi, catalogApiRef } from '@backstage/plugin-catalog-react';
import { Fixtures } from '../../utils/TestUtils';
import { renderWrapped } from '../../utils/TestUtils';
import { SettingsPage } from './SettingsPage';
import { mock } from 'jest-mock-extended';
import {
  EntityFilter,
  ExtensionApi,
} from '@cortexapps/backstage-plugin-extensions';
import { extensionApiRef } from '../../api/ExtensionApi';
import { waitFor } from '@testing-library/react';
import { ConfigApi, configApiRef } from '@backstage/core-plugin-api';

describe('<SettingsPage/>', () => {
  const component1 = Fixtures.entity({
    kind: 'Component',
    metadata: Fixtures.entityMeta({ name: 'foo' }),
    relations: [
      { type: 'ownedBy', targetRef: 'Group:shared' },
      { type: 'ownedBy', targetRef: 'Group:mine' },
    ],
  });

  const component2 = Fixtures.entity({
    kind: 'Component',
    metadata: Fixtures.entityMeta({ name: 'bar' }),
    relations: [
      { type: 'ownedBy', targetRef: 'Group:alsomine' },
      { type: 'ownedBy', targetRef: 'Group:shared' },
    ],
  });

  const team1 = {
    teamTag: 'my-group',
    name: 'My Group',
    shortDescription: 'Short Description',
    fullDescription: 'Full Description',
    links: [
      {
        name: 'Link',
        type: 'DOCUMENTATION',
        url: 'URL',
        description: 'description',
      },
    ],
    slackChannels: [{ name: 'Slack Channel', notificationsEnabled: true }],
    emailMembers: [{ name: 'Email Member', email: 'emailmember@cortex.io' }],
    additionalMembers: [
      { name: 'Additional Member', email: 'additionalmember@cortex.io' },
    ],
  };

  const team2 = {
    teamTag: 'my-other-group',
    name: 'My Other Group',
  };

  const teams = [team1, team2];
  const relationships = [
    { parentTeamTag: team1.teamTag, childTeamTag: team2.teamTag },
  ];

  const configApi: (syncWithGzip?: boolean) => Partial<ConfigApi> =
    syncWithGzip => ({
      getOptionalBoolean(key) {
        if (key === 'cortex.syncWithGzip') {
          return syncWithGzip ?? false;
        }
        return undefined;
      },
    });

  const catalogApi: Partial<CatalogApi> = {
    async getEntities(_) {
      return {
        items: [component1, component2],
      };
    },
  };

  const extension = {
    'x-cortex-git': {
      github: {
        repository: 'my/repo',
      },
    },
  };

  const extensionApi: Partial<ExtensionApi> = {
    async getCustomMappings() {
      return [() => extension];
    },

    async getTeamOverrides(_) {
      return {
        teams,
        relationships,
      };
    },
  };

  const cortexApi = mock<CortexApi>();

  it('should submit entity sync with custom mappings and group overrides', async () => {
    cortexApi.submitEntitySync.mockResolvedValue({ percentage: null });
    cortexApi.getEntitySyncProgress.mockResolvedValue({ percentage: null });
    cortexApi.getLastEntitySyncTime.mockResolvedValue({
      lastSynced: null,
    });
    const { clickButton, checkForText, queryByLabelText } = renderWrapped(
      <SettingsPage />,
      cortexApi,
      {},
      [catalogApiRef, catalogApi],
      [configApiRef, configApi(undefined)],
      [extensionApiRef, extensionApi],
    );

    await checkForText(/Entities have never been synced before/);
    expect(
      await queryByLabelText('Cancel entity sync'),
    ).not.toBeInTheDocument();
    await clickButton('Sync Entities');
    await waitFor(() =>
      expect(queryByLabelText('Sync Entities')).toHaveAttribute(
        'aria-busy',
        'false',
      ),
    );
    await checkForText(/Entities have never been synced before/);
    expect(cortexApi.submitEntitySync).toHaveBeenLastCalledWith(
      [
        { ...component1, spec: extension },
        { ...component2, spec: extension },
      ],
      false,
      { teams, relationships },
    );
  });

  it('should support entity sync with kinds filter', async () => {
    const extensionApi: Partial<ExtensionApi> = {
      getSyncEntityFilter(): Promise<EntityFilter> {
        return Promise.resolve({
          kinds: [],
        });
      },
    };

    const catalogApi = mock<CatalogApi>();

    catalogApi.getEntities.mockResolvedValue(
      Promise.resolve({
        items: [],
      }),
    );

    cortexApi.submitEntitySync.mockResolvedValue({ percentage: null });
    cortexApi.getEntitySyncProgress.mockResolvedValue({ percentage: null });
    cortexApi.getLastEntitySyncTime.mockResolvedValue({
      lastSynced: null,
    });

    const { clickButton, checkForText, queryByLabelText } = renderWrapped(
      <SettingsPage />,
      cortexApi,
      {},
      [catalogApiRef, catalogApi],
      [configApiRef, configApi(undefined)],
      [extensionApiRef, extensionApi],
    );

    await clickButton('Sync Entities');
    await waitFor(() =>
      expect(queryByLabelText('Sync Entities')).toHaveAttribute(
        'aria-busy',
        'false',
      ),
    );
    await checkForText(/Entities have never been synced before/);

    expect(catalogApi.getEntities).toHaveBeenCalledWith({
      filter: { kind: [] },
    });

    expect(cortexApi.submitEntitySync).toHaveBeenLastCalledWith(
      [],
      false,
      undefined,
    );
  });

  it('should support entity sync with kinds filter and entity filter', async () => {
    const extensionApi: Partial<ExtensionApi> = {
      getSyncEntityFilter(): Promise<EntityFilter> {
        return Promise.resolve({
          kinds: ['Component'],
          entityFilter: entity => entity.metadata.name === 'foo',
        });
      },
    };

    const catalogApi = mock<CatalogApi>();

    catalogApi.getEntities.mockResolvedValue(
      Promise.resolve({
        items: [component1, component2],
      }),
    );

    cortexApi.submitEntitySync.mockResolvedValue({ percentage: null });
    cortexApi.getEntitySyncProgress.mockResolvedValue({ percentage: null });
    cortexApi.getLastEntitySyncTime.mockResolvedValue({
      lastSynced: null,
    });

    const { clickButton, queryByLabelText } = renderWrapped(
      <SettingsPage />,
      cortexApi,
      {},
      [catalogApiRef, catalogApi],
      [configApiRef, configApi(undefined)],
      [extensionApiRef, extensionApi],
    );

    await clickButton('Sync Entities');
    await waitFor(() =>
      expect(queryByLabelText('Sync Entities')).toHaveAttribute(
        'aria-busy',
        'false',
      ),
    );

    expect(catalogApi.getEntities).toHaveBeenCalledWith({
      filter: { kind: ['Component'] },
    });

    expect(cortexApi.submitEntitySync).toHaveBeenLastCalledWith(
      [component1],
      false,
      undefined,
    );
  });

  it('should submit entity sync with gzip', async () => {
    cortexApi.submitEntitySync.mockResolvedValue({ percentage: null });
    cortexApi.getEntitySyncProgress.mockResolvedValue({ percentage: null });
    cortexApi.getLastEntitySyncTime.mockResolvedValue({
      lastSynced: null,
    });
    const { clickButton, queryByLabelText } = renderWrapped(
      <SettingsPage />,
      cortexApi,
      {},
      [catalogApiRef, catalogApi],
      [configApiRef, configApi(true)],
      [extensionApiRef, extensionApi],
    );

    await clickButton('Sync Entities');
    await waitFor(() =>
      expect(queryByLabelText('Sync Entities')).toHaveAttribute(
        'aria-busy',
        'false',
      ),
    );

    expect(cortexApi.submitEntitySync).toHaveBeenLastCalledWith(
      [component1, component2],
      true,
      { teams, relationships },
    );
  });

  it('shows in progress entity sync', async () => {
    cortexApi.getEntitySyncProgress.mockResolvedValue({ percentage: 0.7 });
    cortexApi.getLastEntitySyncTime.mockResolvedValue({
      lastSynced: null,
    });
    const { checkForText, getByTestId, queryByLabelText } = renderWrapped(
      <SettingsPage />,
      cortexApi,
      {},
      [catalogApiRef, catalogApi],
      [extensionApiRef, extensionApi],
    );

    await checkForText(/Entities have never been synced before/);
    expect(await queryByLabelText(/Cancel entity sync/)).toBeVisible();
    expect(getByTestId('PollingLinearGauge-entity-sync')).toBeVisible();
  });

  it('shows the last sync time', async () => {
    cortexApi.getEntitySyncProgress.mockResolvedValue({ percentage: null });
    cortexApi.getLastEntitySyncTime.mockResolvedValue({
      lastSynced: '2000-01-01T00:00:00',
    });
    const { checkForText, queryByLabelText } = renderWrapped(
      <SettingsPage />,
      cortexApi,
      {},
      [catalogApiRef, catalogApi],
      [extensionApiRef, extensionApi],
    );

    await checkForText(/Last synced on Jan 1st 2000/);
    expect(
      await queryByLabelText('Cancel entity sync'),
    ).not.toBeInTheDocument();
  });

  it('should handle errors from sync dispatch gracefully', async () => {
    cortexApi.submitEntitySync.mockRejectedValue(new Error('Error communicating with Cortex'));
    cortexApi.getEntitySyncProgress.mockResolvedValue({ percentage: null });
    cortexApi.getLastEntitySyncTime.mockResolvedValue({
      lastSynced: null,
    });
    const { clickButton, checkForText } = renderWrapped(
      <SettingsPage />,
      cortexApi,
      {},
      [catalogApiRef, catalogApi],
      [configApiRef, configApi(true)],
      [extensionApiRef, extensionApi],
    );

    await clickButton('Sync Entities');
    await checkForText(/Entities have never been synced before/);
  })
});
