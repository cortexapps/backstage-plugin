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
import {
  ExtensionApi,
  UiExtensions,
} from '@cortexapps/backstage-plugin-extensions';
import { renderWrapped } from '../../utils/TestUtils';
import { rootRouteRef } from '../../routes';
import { extensionApiRef } from '../../api/ExtensionApi';
import { CortexPage } from './CortexPage';
import { CortexApi } from '../../api/CortexApi';
import { UserPermissionsResponse } from '../../api/types';
import { ConfigApi, configApiRef } from '@backstage/core-plugin-api';

describe('<CortexPage/>', () => {
  const cortexApi: Partial<CortexApi> = {
    getUserPermissions(): Promise<UserPermissionsResponse> {
      return Promise.resolve({
        permissions: [],
      });
    },
  };

  const configApi: Partial<ConfigApi> = {
    getOptionalBoolean: (_: string) => {
      return undefined;
    },
  };

  it('should render help tab if help page is defined in extensions', () => {
    const extensionApi: ExtensionApi = {
      getUiExtensions(): Promise<UiExtensions> {
        return Promise.resolve({
          helpPage: {
            links: [],
          },
        });
      },
    };

    const { findByText } = renderWrapped(
      <CortexPage />,
      cortexApi,
      { '/': rootRouteRef as any },
      [extensionApiRef, extensionApi],
      [configApiRef, configApi],
    );

    expect(findByText('/Help/')).toBeVisible();
  });

  it('should not render help tab if help page is not defined in extensions', () => {
    const extensionApi: ExtensionApi = {};

    const { findByText } = renderWrapped(
      <CortexPage />,
      cortexApi,
      { '/': rootRouteRef as any },
      [extensionApiRef, extensionApi],
      [configApiRef, configApi],
    );

    expect(findByText('/Help/')).not.toBeVisible();
  });
});
