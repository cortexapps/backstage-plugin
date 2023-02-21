/*
 * Copyright 2021 Cortex Applications, Inc.
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

import {
  EntitySyncProgress,
  GroupByOption,
  Initiative,
  InitiativeActionItem,
  InitiativeWithScores,
  LastEntitySyncTime,
  OncallsResponse,
  Scorecard,
  ScorecardLadder,
  ScorecardResult,
  ScorecardScoreNextSteps,
  ScorecardServiceScore,
  ScoresByIdentifier,
  ServiceScorecardScore,
} from './types';
import { CortexApi } from './CortexApi';
import { Entity } from '@backstage/catalog-model';
import { Buffer } from 'buffer';
import { Moment } from 'moment/moment';
import { AnyEntityRef, stringifyAnyEntityRef } from '../utils/types';
import {
  CustomMapping,
  TeamOverrides,
} from '@cortexapps/backstage-plugin-extensions';
import { applyCustomMappings } from '../utils/ComponentUtils';
import {
  createApiRef,
  DiscoveryApi,
  IdentityApi,
} from '@backstage/core-plugin-api';
import { gzipSync } from 'zlib';
import {
  GetUserInsightsResponse,
  HomepageEntityResponse,
} from './userInsightTypes';

export const cortexApiRef = createApiRef<CortexApi>({
  id: 'plugin.cortex.service',
});

type Options = {
  discoveryApi: DiscoveryApi;
  identityApi?: IdentityApi;
};

type QueryParamVal = string | string[];

function isString(val: QueryParamVal): val is string {
  return typeof val === 'string';
}

export class CortexClient implements CortexApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly identityApi?: IdentityApi;

  constructor(options: Options) {
    this.discoveryApi = options.discoveryApi;
    this.identityApi = options.identityApi;
  }

  async getScorecards(): Promise<Scorecard[]> {
    return await this.get(`/api/backstage/v1/scorecards`);
  }

  async submitEntitySync(
    entities: Entity[],
    gzipContents: boolean,
    customMappings?: CustomMapping[],
    teamOverrides?: TeamOverrides,
  ): Promise<EntitySyncProgress> {
    const withCustomMappings: Entity[] = customMappings
      ? entities.map(entity => applyCustomMappings(entity, customMappings))
      : entities;

    if (gzipContents) {
      return await this.postWithGzipBody(`/api/backstage/v1/entities/sync`, {
        entities: withCustomMappings,
        teamOverrides,
      });
    } else {
      return await this.post(`/api/backstage/v1/entities/sync`, {
        entities: withCustomMappings,
        teamOverrides,
      });
    }
  }

  async getServiceScores(
    entityRef: AnyEntityRef,
  ): Promise<ServiceScorecardScore[]> {
    return await this.get(`/api/backstage/v2/entities/scorecards`, {
      ref: stringifyAnyEntityRef(entityRef),
    });
  }

  async getServiceNextSteps(
    entityRef: AnyEntityRef,
    scorecardId: number,
  ): Promise<ScorecardScoreNextSteps[]> {
    return await this.get(
      `/api/backstage/v2/entities/${scorecardId}/ladders/next-steps`,
      {
        ref: stringifyAnyEntityRef(entityRef),
      },
    );
  }

  async getHistoricalScores(
    scorecardId: string,
    entityRef: AnyEntityRef,
    startDate?: Moment,
    endDate?: Moment,
  ): Promise<ScorecardResult[]> {
    const results: ScorecardResult[] = await this.get(
      `/api/backstage/v1/scorecards/${scorecardId}/scores/historical`,
      {
        ref: stringifyAnyEntityRef(entityRef),
        ...(startDate && { startDate: startDate.toISOString() }),
        ...(endDate && { endDate: endDate.toISOString() }),
      },
    );

    return results.sort((a, b) => {
      return (
        new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime()
      );
    });
  }

  async getAverageHistoricalScores(
    scorecardId: number,
    groupBy: GroupByOption,
    options: {
      ruleExpression?: string;
      startDate?: Moment;
      endDate?: Moment;
    },
  ): Promise<ScoresByIdentifier[]> {
    const { ruleExpression, startDate, endDate } = options;

    const scores: ScoresByIdentifier[] = await this.get(
      `/api/backstage/v1/scorecards/${scorecardId}/scores/historical-average`,
      {
        ...(groupBy !== GroupByOption.SERVICE && {
          groupBy: groupBy.toUpperCase().replace(' ', '_'),
        }),
        ...(ruleExpression && { ruleExpression: ruleExpression }),
        ...(startDate && { startDate: startDate.toISOString() }),
        ...(startDate && { startDate: startDate.toISOString() }),
        ...(endDate && { endDate: endDate.toISOString() }),
      },
    );

    return scores.map(score => {
      return {
        identifier: score.identifier,
        scores: score.scores.sort((a, b) => {
          return (
            new Date(a.dateCreated!!).getTime() -
            new Date(b.dateCreated!!).getTime()
          );
        }),
        numberOfServices: 1,
      };
    });
  }

  async getServiceScorecardScores(
    groupBy: GroupByOption,
  ): Promise<ScoresByIdentifier[]> {
    const args =
      groupBy !== GroupByOption.SERVICE
        ? {
            groupBy: groupBy.toUpperCase().replace(' ', '_'),
          }
        : undefined;

    return await this.get(`/api/backstage/v1/scorecards/scores`, args);
  }

  async getScorecard(scorecardId: number): Promise<Scorecard> {
    return await this.get(`/api/backstage/v1/scorecards/${scorecardId}`);
  }

  async getScorecardLadders(scorecardId: number): Promise<ScorecardLadder[]> {
    return await this.get(
      `/api/backstage/v1/scorecards/${scorecardId}/ladders`,
    );
  }

  async getScorecardScores(
    scorecardId: number,
  ): Promise<ScorecardServiceScore[]> {
    return await this.get(`/api/backstage/v1/scorecards/${scorecardId}/scores`);
  }

  async getInitiatives(): Promise<Initiative[]> {
    return await this.get(`/api/backstage/v1/initiatives`);
  }

  async getInitiative(id: number): Promise<InitiativeWithScores> {
    return await this.get(`/api/backstage/v1/initiatives/${id}`);
  }

  async getInitiativeActionItems(id: number): Promise<InitiativeActionItem[]> {
    return await this.get(`/api/backstage/v1/initiatives/${id}/actionitems`);
  }

  async getInitiativeActionItemsForTeam(
    entityRef: AnyEntityRef,
  ): Promise<InitiativeActionItem[]> {
    return await this.get(`/api/backstage/v1/teams/initiatives/action-items`, {
      ref: stringifyAnyEntityRef(entityRef),
    });
  }

  async getComponentActionItems(
    entityRef: AnyEntityRef,
  ): Promise<InitiativeActionItem[]> {
    return await this.get(
      `/api/backstage/v1/entities/initiatives/actionitems`,
      {
        ref: stringifyAnyEntityRef(entityRef),
      },
    );
  }

  async getBulkComponentActionItems(
    entityRefs: AnyEntityRef[],
  ): Promise<InitiativeActionItem[]> {
    return await this.get(
      `/api/backstage/v1/entities/initiatives/actionitems`,
      {
        refs: entityRefs.map(entityRef => stringifyAnyEntityRef(entityRef)),
      },
    );
  }

  async getEntitySyncProgress(): Promise<EntitySyncProgress> {
    return await this.get(`/api/backstage/v1/entities/progress`);
  }

  async getLastEntitySyncTime(): Promise<LastEntitySyncTime> {
    return await this.get(`/api/backstage/v1/entities/last-sync`);
  }

  async cancelEntitySync(): Promise<void> {
    await this.delete(`/api/backstage/v1/entities/sync`);
  }

  async getUserOncallByEmail(email: string): Promise<OncallsResponse> {
    return this.get(`/api/backstage/v1/homepage/oncall?email=${email}`);
  }

  async getInsightsByEmail(email: string): Promise<GetUserInsightsResponse> {
    return this.get(`/api/backstage/v1/homepage/insights?email=${email}`);
  }

  async getCatalogEntities(): Promise<HomepageEntityResponse> {
    return this.get(`/api/backstage/v1/homepage/catalog`);
  }

  private async getBasePath(): Promise<string> {
    const proxyBasePath = await this.discoveryApi.getBaseUrl('proxy');
    return `${proxyBasePath}/cortex`;
  }

  private async get(
    path: string,
    args?: { [key: string]: QueryParamVal },
  ): Promise<any | undefined> {
    const basePath = await this.getBasePath();

    const url = `${basePath}${path}`;
    const queryParams =
      args &&
      Object.keys(args)
        .flatMap((key: string) => {
          const val: QueryParamVal = args[key];
          if (isString(val)) {
            return [[key, val]];
          }
          return val.map(v => [key, v]);
        })
        .map(kv => {
          const [key, val] = kv;
          return `${encodeURIComponent(key)}=${encodeURIComponent(val)}`;
        })
        .join('&');

    const queryUrl = queryParams ? `${url}?${queryParams}` : url;
    const response = await this.fetchAuthenticated(queryUrl);
    const body = await response.json();

    if (response.status === 404) {
      return undefined;
    } else if (response.status !== 200) {
      throw new Error(
        `Error communicating with Cortex: ${
          typeof body === 'object' ? JSON.stringify(body) : body
        }`,
      );
    }

    return body;
  }

  private async post(path: string, body?: any): Promise<any> {
    const basePath = await this.getBasePath();
    const url = `${basePath}${path}`;

    const response = await this.fetchAuthenticated(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status !== 200) {
      throw new Error(`Error communicating with Cortex`);
    }

    return response.json();
  }

  private async postWithGzipBody(path: string, body?: any): Promise<any> {
    const basePath = await this.getBasePath();
    const url = `${basePath}${path}`;

    const input = Buffer.from(JSON.stringify(body), 'utf-8');
    const compressed = gzipSync(input);

    const response = await this.fetchAuthenticated(url, {
      method: 'POST',
      body: compressed,
      headers: {
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
      },
    });

    if (response.status !== 200) {
      throw new Error(`Error communicating with Cortex`);
    }

    return response.json();
  }

  private async delete(path: string, body?: any): Promise<void> {
    const basePath = await this.getBasePath();
    const url = `${basePath}${path}`;

    const response = await this.fetchAuthenticated(url, {
      method: 'DELETE',
      body: body && JSON.stringify(body),
      headers: body && { 'Content-Type': 'application/json' },
    });

    if (response.status !== 200) {
      throw new Error(`Error communicating with Cortex`);
    }
  }

  private async fetchAuthenticated(
    input: RequestInfo,
    init?: RequestInit,
  ): Promise<Response> {
    let token: string | undefined = undefined;
    if (this.identityApi !== undefined) {
      ({ token } = await this.identityApi.getCredentials());
    }

    if (token !== undefined) {
      return fetch(input, {
        ...init,
        headers: {
          ...init?.headers,
          Authorization: `Bearer ${token}`,
        },
      });
    } else {
      return fetch(input, init);
    }
  }
}
