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
import { ScorecardLadder } from '../api/types';

export const getSortedLadderLevels = (ladder: ScorecardLadder) =>
  [...(ladder?.levels ?? [])].sort((a, b) => a.rank - b.rank);

export const getSortedLadderLevelNames = (
  ladder: ScorecardLadder,
  includeNoLevel: boolean = false,
) => {
  const sortedLevels = getSortedLadderLevels(ladder).map(level => level.name);
  return includeNoLevel ? ['No Level', ...sortedLevels] : sortedLevels;
};
