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

import {
  DomainHierarchiesResponse,
  EntitySyncProgress,
  ExpirationResponse,
  GroupByOption,
  Initiative,
  InitiativeActionItem,
  InitiativeWithScores,
  JobsResponse,
  LastEntitySyncTime,
  OncallsResponse,
  Scorecard,
  ScorecardLadder,
  ScorecardResult,
  ScorecardRuleExemptionResult,
  ScorecardScoreNextSteps,
  ScorecardServiceScore,
  ScoresByIdentifier,
  ServiceScorecardScore,
  TeamHierarchiesResponse,
  UserPermissionsResponse,
} from './types';
import { CortexApi } from './CortexApi';
import { Entity } from '@backstage/catalog-model';
import { Buffer } from 'buffer';
import { Moment } from 'moment/moment';
import { chunk, mapValues } from 'lodash';
import { AnyEntityRef, stringifyAnyEntityRef } from '../utils/types';
import { TeamOverrides } from '@cortexapps/backstage-plugin-extensions';
import {
  createApiRef,
  DiscoveryApi,
  IdentityApi,
} from '@backstage/core-plugin-api';
import { gzipSync } from 'zlib';
import {
  EntityDomainAncestorsResponse,
  GetUserInsightsResponse,
  HomepageEntityResponse,
  UserEntitiesResponse,
} from './userInsightTypes';
import { Domain, TeamResponse } from '@cortexapps/birdseye';

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
    return await this.get(`/api/backstage/v2/scorecards`);
  }

  async submitEntitySync(
    entities: Entity[],
    gzipContents: boolean,
    teamOverrides?: TeamOverrides,
  ): Promise<EntitySyncProgress> {
    const post = async (path: string, body?: any) => {
      return gzipContents
        ? await this.postVoidWithGzipBody(path, body)
        : await this.postVoid(path, body);
    };

    await this.postVoid('/api/backstage/v2/entities/sync-init');

    for (let customMappingsChunk of chunk(entities, CHUNK_SIZE)) {
      await post(`/api/backstage/v2/entities/sync-chunked`, {
        entities: customMappingsChunk,
      });
    }

    for (let teamOverridesTeamChunk of chunk(
      teamOverrides?.teams ?? [],
      CHUNK_SIZE,
    )) {
      await post(`/api/backstage/v2/entities/sync-chunked`, {
        entities: [],
        teamOverrides: {
          teams: teamOverridesTeamChunk,
          relationships: [],
        },
      });
    }

    for (let teamOverridesRelationshipsChunk of chunk(
      teamOverrides?.relationships ?? [],
      CHUNK_SIZE,
    )) {
      await post(`/api/backstage/v2/entities/sync-chunked`, {
        entities: [],
        teamOverrides: {
          teams: [],
          relationships: teamOverridesRelationshipsChunk,
        },
      });
    }

    return await this.post('/api/backstage/v2/entities/sync-submit');
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
        ...(groupBy !== GroupByOption.ENTITY && {
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
      groupBy !== GroupByOption.ENTITY
        ? {
            groupBy: groupBy.toUpperCase().replace(' ', '_'),
          }
        : undefined;

    return await this.get(`/api/backstage/v1/scorecards/scores`, args);
  }

  async getScorecard(scorecardId: number): Promise<Scorecard> {
    return await this.get(`/api/backstage/v2/scorecards/${scorecardId}`);
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

  async getScorecardRuleExemptions(
    scorecardId: number,
  ): Promise<ScorecardRuleExemptionResult> {
    return await this.get(
      `/api/backstage/v1/scorecards/${scorecardId}/rules/exemptions`,
    );
  }

  async getInitiatives(): Promise<Initiative[]> {
    return await this.get(`/api/backstage/v2/initiatives`);
  }

  async getInitiative(id: number): Promise<InitiativeWithScores> {
    return await this.get(`/api/backstage/v2/initiatives/${id}`);
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
    return await this.get(`/api/backstage/v2/entities/progress`);
  }

  async getLastEntitySyncTime(): Promise<LastEntitySyncTime> {
    return await this.get(`/api/backstage/v2/entities/last-sync`);
  }

  async cancelEntitySync(): Promise<void> {
    await this.delete(`/api/backstage/v2/entities/sync`);
  }

  async getUserOncallByEmail(): Promise<OncallsResponse> {
    return this.get(`/api/backstage/v2/homepage/oncall`);
  }

  async getInsightsByEmail(): Promise<GetUserInsightsResponse> {
    return this.get(`/api/backstage/v2/homepage/insights`);
  }

  async getCatalogEntities(): Promise<HomepageEntityResponse> {
    return this.get(`/api/backstage/v1/homepage/catalog`);
  }

  async getUserEntities(): Promise<UserEntitiesResponse> {
    return this.get(`/api/backstage/v2/entities/my-entities`);
  }

  async getUserPermissions(): Promise<UserPermissionsResponse> {
    return this.get(`/api/backstage/v2/permissions`);
  }

  async getSyncJobs(): Promise<JobsResponse> {
    return this.get(`/api/backstage/v2/jobs`);
  }

  async getExpiration(): Promise<ExpirationResponse> {
    return this.get(`/api/backstage/v1/entitlements/expiration-date`);
  }

  async getAllDomains(): Promise<Domain[]> {
    return this.get(`/api/backstage/v2/domains`);
  }

  async getEntityDomainAncestors(): Promise<EntityDomainAncestorsResponse> {
    return this.get(`/api/backstage/v1/domains/hierarchies/ancestors`);
  }

  async getDomainHierarchies(): Promise<DomainHierarchiesResponse> {
    return await this.get(`/api/backstage/v1/domains/hierarchies/tree`);
  }

  async getTeamHierarchies(): Promise<TeamHierarchiesResponse> {
    return await this.get(`/api/backstage/v1/teams/hierarchies`);
  }

  async getAllTeams(): Promise<TeamResponse[]> {
    return this.get(`/api/backstage/v2/teams`);
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

  private async postVoid(path: string, body?: any): Promise<void> {
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

    return;
  }

  private async postVoidWithGzipBody(path: string, body?: any): Promise<void> {
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

    return;
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
    let token: string | undefined;
    let email: string | undefined;
    let displayName: string | undefined;
    if (this.identityApi !== undefined) {
      const [credentials, profileInfo] = await Promise.all([
        this.identityApi.getCredentials(),
        this.identityApi.getProfileInfo(),
      ]);
      token = credentials.token;
      email = profileInfo.email;
      displayName = profileInfo.displayName;
    }

    const xCortexHeaders = mapValues(
      {
        'x-cortex-email': email ?? '',
        'x-cortex-name': displayName ?? '',
      },
      encodeURIComponent,
    );

    const headers = {
      ...init?.headers,
      Authorization: `Bearer ${(token ?? '')
        .replace(/^[Bb]earer\s+/, '')
        .trim()}`,
      ...xCortexHeaders,
    };

    if (token !== undefined) {
      return fetch(input, {
        ...init,
        headers: headers,
      });
    } else {
      return fetch(input, init);
    }
  }
}

const CHUNK_SIZE = 1000;
