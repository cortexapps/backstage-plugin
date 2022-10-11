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
import { CortexApi } from "../../api/CortexApi";
import React from "react";
import { CatalogApi, catalogApiRef } from "@backstage/plugin-catalog-react";
import { Fixtures } from "../../utils/TestUtils";
import { renderWrapped } from "../../utils/TestUtils";
import { SettingsPage } from "./SettingsPage";
import { captor, mock } from 'jest-mock-extended';
import { ExtensionApi } from "@cortexapps/backstage-plugin-extensions";
import { extensionApiRef } from "../../api/ExtensionApi";
import { waitFor } from "@testing-library/react";

describe('<SettingsPage/>', () => {

  const component1 = Fixtures.entity({
    kind: 'Component',
    metadata: Fixtures.entityMeta({ name: 'foo' }),
    relations: [
      { type: 'ownedBy', targetRef: 'Group:shared' },
      { type: 'ownedBy', targetRef: 'Group:mine' },
    ]
  })

  const component2 = Fixtures.entity({
    kind: 'Component',
    metadata: Fixtures.entityMeta({ name: 'bar' }),
    relations: [
      { type: 'ownedBy', targetRef: 'Group:alsomine' },
      { type: 'ownedBy', targetRef: 'Group:shared' },
    ]
  })

  const team1 = {
    teamTag: "my-group",
    name: "My Group",
    shortDescription: "Short Description",
    fullDescription: "Full Description",
    links: [
      { name: "Link", type: "DOCUMENTATION", url: "URL", description: "description" }
    ],
    slackChannels: [
      { name: "Slack Channel", notificationsEnabled: true }
    ],
    emailMembers: [
      { name: "Email Member", email: "emailmember@cortex.io" }
    ],
    additionalMembers: [
      { name: "Additional Member", email: "additionalmember@cortex.io" }
    ]
  }

  const team2 = {
    teamTag: "my-other-group",
    name: "My Other Group"
  }

  const teams = [team1, team2]
  const relationships = [
    { parentTeamTag: team1.teamTag, childTeamTag: team2.teamTag }
  ]

  const catalogApi: Partial<CatalogApi> = {
    async getEntities(_) {
      return {
        items: [component1, component2]
      }
    }
  }

  const cortexApi = mock<CortexApi>();

  it('should sync entities with custom mappings and group overrides', async () => {

    const extension = {
      'x-cortex-git': {
        'github': {
          repository: 'my/repo'
        }
      }
    }

    const extensionApi: Partial<ExtensionApi> = {
      async getCustomMappings() {
        return [() => extension]
      },

      async getTeamOverrides(_) {
        return {
          teams,
          relationships,
        }
      }
    }

    const { clickButton, queryByLabelText } = renderWrapped(
      <SettingsPage/>,
      cortexApi,
      {},
      [catalogApiRef, catalogApi], [extensionApiRef, extensionApi]
    );

    await clickButton('Sync Entities');

    await waitFor(() =>
      expect(queryByLabelText("Sync Entities")).toHaveAttribute('aria-busy', "false")
    );

    const customMappingsCaptor = captor();
    expect(cortexApi.syncEntities).toHaveBeenLastCalledWith(
      [component1, component2],
      customMappingsCaptor,
      { teams, relationships }
    );

    expect(customMappingsCaptor.value).toHaveLength(1);
    expect(customMappingsCaptor.value[0]()).toBe(extension);
  })
});