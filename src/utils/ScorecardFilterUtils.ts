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
import { CategoryFilter, FilterType, Scorecard } from "../api/types";

export function isScorecardTeamBased(scorecard?: Scorecard): boolean {
  return (
    !!scorecard &&
    (scorecard.filter?.type === FilterType.TEAM_FILTER ||
      (scorecard.filter?.type === FilterType.COMPOUND_FILTER &&
        scorecard.filter?.typeFilter?.include &&
        scorecard.filter?.typeFilter?.types.includes('team')) ||
      (scorecard.filter?.type === FilterType.CQL_FILTER &&
        scorecard.filter?.category === CategoryFilter.Team))
  );
}