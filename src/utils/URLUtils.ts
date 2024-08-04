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
import { StringifiableRecord, stringifyUrl } from 'query-string';

interface CortexScorecardServicePageURLProperties {
  scorecardId: string | number;
  serviceId: string | number;
  cortexUrl: string;
}

interface CortexScorecardPageURLProperties {
  scorecardId: string | number;
  cortexUrl: string;
}

interface CortexInitiativePageURLProperties {
  initiativeId: string | number;
  cortexUrl: string;
}

export const buildUrl = (
  queryParamsObj: StringifiableRecord,
  pathname: string,
) =>
  `${window.location.origin}${stringifyUrl({
    url: pathname,
    query: queryParamsObj,
  })}`;

export const cortexScorecardPageUrl = ({
  scorecardId,
  cortexUrl,
}: CortexScorecardPageURLProperties) => {
  return `${cortexUrl}/admin/scorecards/${scorecardId}`;
};

export const cortexScorecardServicePageUrl = ({
  scorecardId,
  serviceId,
  cortexUrl,
}: CortexScorecardServicePageURLProperties) =>
  `${cortexScorecardPageUrl({
    scorecardId: scorecardId,
    cortexUrl: cortexUrl,
  })}?service=${serviceId}`;

export const cortexInitiativePageUrl = ({
  initiativeId,
  cortexUrl,
}: CortexInitiativePageURLProperties) =>
  `${cortexUrl}/admin/initiatives/${initiativeId}`;
