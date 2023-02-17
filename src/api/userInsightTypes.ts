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
export enum UserInsightType {
    ACTION_ITEM = 'ACTION_ITEM',
    FAILING_RULE = 'FAILING_RULE',
    NO_ENTITIES = 'NO_ENTITIES',
    NO_ENTITIES_OWNED = 'NO_ENTITIES_OWNED',
    NO_FAILING_RULES = 'NO_FAILING_RULES',
    NO_SCORECARDS = 'NO_SCORECARDS',
}

export interface BaseUserInsight {
    type: UserInsightType;
}

export interface ActionItemUserInsight extends BaseUserInsight {
    entityId: string;
    initiativeId: string;
    ruleIds: string[];
    targetDate: string;
}

export interface FailingRuleUserInsight extends BaseUserInsight {
    entityId: string;
    nextLadderLevel?: string;
    ruleIds: string[];
    scorecardId: string;
    // TODO (dev-homepage): do we want to show next % if you complete rule(s) for percentage based insight
}

export interface NoEntitiesOwnedUserInsight extends BaseUserInsight {}
export interface NoEntitiesUserInsight extends BaseUserInsight {}
export interface NoFailingRulesUserInsight extends BaseUserInsight {}
export interface NoScorecardsUserInsight extends BaseUserInsight {}

export type UserInsight =
    | ActionItemUserInsight
    | FailingRuleUserInsight
    | NoEntitiesOwnedUserInsight
    | NoEntitiesUserInsight
    | NoFailingRulesUserInsight
    | NoScorecardsUserInsight;

export interface GetUserInsightsResponse {
    insights: UserInsight[];
}

export interface CatalogEntityIcon {
    kind: string;
    tag: string;
    url: string;
}

export interface EmailOwner {
    id?: number;
    entityId?: number;
    email: string;
    description?: string;
}

export interface HomepageEntity {
    codeTag: string;
    definition?: any; // this is x-cortex-definition from entity YAML
    description?: string;
    groupNames: string[];
    icon?: CatalogEntityIcon;
    id: string;
    name: string;
    serviceGroupTags: string[];
    serviceOwnerEmails: EmailOwner[];
    type: string;
}

export interface HomepageEntityResponse {
    entities: HomepageEntity[]
}
