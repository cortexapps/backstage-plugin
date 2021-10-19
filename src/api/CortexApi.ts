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
  GroupByOption,
  Initiative,
  InitiativeActionItem,
  Scorecard, ScorecardLadder,
  ScorecardResult,
  ScorecardServiceScore,
  ScoresByIdentifier,
  ServiceScorecardScore,
} from './types';
import { Entity } from '@backstage/catalog-model';
import { Moment } from 'moment/moment';
import { AnyEntityRef } from '../utils/types';

export interface CortexApi {
  getScorecards(): Promise<Scorecard[]>;
  getScorecard(scorecardId: string): Promise<Scorecard | undefined>;
  getScorecardLadders(scorecardId: string): Promise<ScorecardLadder[]>;
  getScorecardScores(scorecardId: string): Promise<ScorecardServiceScore[]>;
  getServiceScores(entityRef: AnyEntityRef): Promise<ServiceScorecardScore[]>;
  getHistoricalScores(
    scorecardId: string,
    entityRef: AnyEntityRef,
    startDate?: Moment,
    endDate?: Moment,
  ): Promise<ScorecardResult[]>;
  getAverageHistoricalScores(
    scorecardId: string,
    groupBy: GroupByOption,
    options: {
      ruleExpression?: string;
      startDate?: Moment;
      endDate?: Moment;
    },
  ): Promise<ScoresByIdentifier[]>;

  getServiceScorecardScores(): Promise<ScoresByIdentifier[]>;

  getInitiatives(): Promise<Initiative[]>;
  getInitiative(id: string): Promise<Initiative>;
  getInitiativeActionItems(id: string): Promise<InitiativeActionItem[]>;
  getComponentActionItems(
    entityRef: AnyEntityRef,
  ): Promise<InitiativeActionItem[]>;
  getBulkComponentActionItems(
    entityRefs: AnyEntityRef[],
  ): Promise<InitiativeActionItem[]>;

  syncEntities(entities: Entity[]): Promise<void>;
}
