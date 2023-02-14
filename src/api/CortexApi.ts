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
  Scorecard,
  ScorecardLadder,
  ScorecardResult,
  ScorecardScoreNextSteps,
  ScorecardServiceScore,
  ScoresByIdentifier,
  ServiceScorecardScore,
} from './types';
import { Entity } from '@backstage/catalog-model';
import { Moment } from 'moment/moment';
import { AnyEntityRef } from '../utils/types';
import {
  CustomMapping,
  TeamOverrides,
} from '@cortexapps/backstage-plugin-extensions';

export interface CortexApi {
  getScorecards(): Promise<Scorecard[]>;
  getScorecard(scorecardId: number): Promise<Scorecard | undefined>;
  getScorecardLadders(scorecardId: number): Promise<ScorecardLadder[]>;
  getScorecardScores(scorecardId: number): Promise<ScorecardServiceScore[]>;

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
    customMappings?: CustomMapping[],
    teamOverrides?: TeamOverrides,
  ): Promise<EntitySyncProgress>;

  getEntitySyncProgress(): Promise<EntitySyncProgress>;

  getLastEntitySyncTime(): Promise<LastEntitySyncTime>;

  cancelEntitySync(): Promise<void>;
}
