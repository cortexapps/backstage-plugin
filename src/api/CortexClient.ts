/*
 * Copyright 2021 Cortex Applications Inc.
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

import { createApiRef, DiscoveryApi } from '@backstage/core';
import { ServiceScorecardScore } from "./types";
import { CortexApi } from "./CortexApi";
import { Entity } from '@backstage/catalog-model';

export const cortexApiRef = createApiRef<CortexClient>({
  id: 'plugin.cortex.service',
  description: 'Used by the Cortex plugin to make requests',
});

type Options = {
  discoveryApi: DiscoveryApi;
};

export class CortexClient implements CortexApi {
  private readonly discoveryApi: DiscoveryApi;

  constructor(options: Options) {
    this.discoveryApi = options.discoveryApi;
  }

  async syncEntities(entities: Entity[]): Promise<void> {
    return await this.post(`/api/internal/v1/backstage`, { entities: entities })
  }

  async getScores(service: string): Promise<ServiceScorecardScore[] | undefined> {
    return await this.get(`/api/v1/services/tags/${service}/scorecards`)
  }

  private async getBasePath(): Promise<string> {
    const proxyBasePath = await this.discoveryApi.getBaseUrl('proxy');
    return `${proxyBasePath}/cortex`
  }

  private async get(path: string): Promise<any | undefined> {
    const basePath = await this.getBasePath();
    const url = `${basePath}${path}`;

    const response = await fetch(url);
    const body = await response.json();

    if (response.status === 404)
    {
      return undefined;
    } else if (response.status !== 200) {
      throw new Error(
        `Error communicating with Cortex: ${typeof body === 'object' ? JSON.stringify(body) : body}`,
      );
    }

    return body;
  }

  private async post(path: string, body?: any): Promise<any | undefined> {
    const basePath = await this.getBasePath();
    const url = `${basePath}${path}`;

    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' }
    });

    const responseBody = await response.json();
    if (response.status !== 200) {
      throw new Error(
        `Error communicating with Cortex: ${JSON.stringify(responseBody)}`,
      );
    }

    return responseBody;
  }
}
