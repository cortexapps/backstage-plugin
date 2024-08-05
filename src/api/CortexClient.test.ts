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

import { CortexClient } from './CortexClient';
import { IdentityApi } from '@backstage/core-plugin-api';
import { mock } from 'jest-mock-extended';

const mockFetch = jest.fn().mockResolvedValue({
  status: 200,
  json: () => Promise.resolve({}),
});
global.fetch = mockFetch;

describe('CortexClient', () => {
  const getCortexClient = (
    email: string = 'e@mail.com',
    displayName: string = 'Na Me',
  ) =>
    new CortexClient({
      discoveryApi: {
        getBaseUrl: () => Promise.resolve('http://localhost:3000'),
      },
      identityApi: mock<IdentityApi>({
        getCredentials: () =>
          Promise.resolve({
            token: 'toKen',
          }),
        getProfileInfo: () =>
          Promise.resolve({
            email,
            displayName,
          }),
      }),
    });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  [
    {
      email: 'e@mail.com',
      displayName: 'NaMe',
    },
    {
      email: 'tony@cortex.io',
      displayName: 'Tony Vespa',
    },
    {
      email: 'foreign.exchange.student@cortex.io',
      displayName: 'Fez Ąğłóżź',
    },
  ].forEach(({ email, displayName }) => {
    it(`fetch is called with x-cortex headers [${email}] [${displayName}]`, async () => {
      await getCortexClient(email, displayName).cancelEntitySync();
      expect(fetch).toBeCalledWith(
        expect.anything(),
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-cortex-email': encodeURIComponent(email),
            'x-cortex-name': encodeURIComponent(displayName),
          }),
        }),
      );
    });
  });
});
