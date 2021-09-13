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
  Scorecard,
  ScorecardResult,
  ScorecardServiceScore,
  ServiceScorecardScore,
} from './types';
import { Entity } from '@backstage/catalog-model';
import { Moment } from 'moment/moment';
import { AnyEntityRef } from '../utils/types';

export enum GroupByOption {
  'OWNER' = 'Owner',
  'TEAM' = 'Team',
  'SERVICE_GROUP' = 'Service Group',
}

export interface CortexApi {
  getScorecards(): Promise<Scorecard[]>;
  getScorecard(scorecardId: string): Promise<Scorecard | undefined>;
  getScorecardScores(scorecardId: string): Promise<ScorecardServiceScore[]>;
  getServiceScores(entityRef: AnyEntityRef): Promise<ServiceScorecardScore[]>;
  getHistoricalScores(
    scorecardId: string,
    entityRef: AnyEntityRef,
    startDate?: Moment,
    endDate?: Moment,
  ): Promise<ScorecardResult[]>;
  syncEntities(entities: Entity[]): Promise<void>;
}
