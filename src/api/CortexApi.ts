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
  ServiceGroupsResponse,
  ServiceScorecardScore,
  TeamHierarchiesResponse,
  UserPermissionsResponse,
} from './types';
import { Entity } from '@backstage/catalog-model';
import { Moment } from 'moment/moment';
import { AnyEntityRef } from '../utils/types';
import { TeamOverrides } from '@cortexapps/backstage-plugin-extensions';
import {
  EntityDomainAncestorsResponse,
  GetUserInsightsResponse,
  HomepageEntityResponse,
  UserEntitiesResponse,
} from './userInsightTypes';
import {
  Domain,
  StringIndexable,
  TeamDetails,
  TeamResponse,
} from '@cortexapps/birdseye';

export interface CortexApi {
  getScorecards(): Promise<Scorecard[]>;

  getScorecard(scorecardId: number): Promise<Scorecard | undefined>;

  getScorecardLadders(scorecardId: number): Promise<ScorecardLadder[]>;

  getScorecardScores(scorecardId: number): Promise<ScorecardServiceScore[]>;

  getScorecardRuleExemptions(
    scorecardId: number,
  ): Promise<ScorecardRuleExemptionResult>;

  getServiceScores(entityRef: AnyEntityRef): Promise<ServiceScorecardScore[]>;

  getServiceNextSteps(
    entityRef: AnyEntityRef,
    scorecardId: number,
  ): Promise<ScorecardScoreNextSteps[]>;

  getHistoricalScores(
    scorecardId: string,
    entityRef: AnyEntityRef,
    startDate?: Moment,
    endDate?: Moment,
  ): Promise<ScorecardResult[]>;

  getAverageHistoricalScores(
    scorecardId: number,
    groupBy: GroupByOption,
    options: {
      ruleExpression?: string;
      startDate?: Moment;
      endDate?: Moment;
    },
  ): Promise<ScoresByIdentifier[]>;

  getServiceScorecardScores(
    groupBy: GroupByOption,
  ): Promise<ScoresByIdentifier[]>;

  getInitiatives(): Promise<Initiative[]>;

  getInitiative(id: number): Promise<InitiativeWithScores>;

  getInitiativeActionItems(id: number): Promise<InitiativeActionItem[]>;

  getInitiativeActionItemsForTeam(
    entityRef: AnyEntityRef,
  ): Promise<InitiativeActionItem[]>;

  getComponentActionItems(
    entityRef: AnyEntityRef,
  ): Promise<InitiativeActionItem[]>;

  getBulkComponentActionItems(
    entityRefs: AnyEntityRef[],
  ): Promise<InitiativeActionItem[]>;

  submitEntitySync(
    entities: Entity[],
    shouldGzipBody: boolean,
    teamOverrides?: TeamOverrides,
    chunkSize?: number,
  ): Promise<EntitySyncProgress>;

  getEntitySyncProgress(): Promise<EntitySyncProgress>;

  getLastEntitySyncTime(): Promise<LastEntitySyncTime>;

  cancelEntitySync(): Promise<void>;

  getUserOncallByEmail(): Promise<OncallsResponse>;

  getInsightsByEmail(): Promise<GetUserInsightsResponse>;

  getCatalogEntities(): Promise<HomepageEntityResponse>;

  getUserEntities(): Promise<UserEntitiesResponse>;

  getUserPermissions(): Promise<UserPermissionsResponse>;

  getSyncJobs(): Promise<JobsResponse>;

  getExpiration(): Promise<ExpirationResponse>;

  getAllDomains(): Promise<{ domains: Domain[] }>;

  getEntityDomainAncestors(): Promise<EntityDomainAncestorsResponse>;

  getDomainHierarchies(): Promise<DomainHierarchiesResponse>;

  getTeamHierarchies(): Promise<TeamHierarchiesResponse>;

  getAllTeams(): Promise<{ teams: TeamResponse[] }>;

  getTeamsByEntityIds(entityIds: number[]): Promise<{
    teamsByEntityId: StringIndexable<TeamDetails[]>;
  }>;

  getServiceGroups(): Promise<ServiceGroupsResponse>;
}
