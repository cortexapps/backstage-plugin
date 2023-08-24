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
import React from 'react';
import { StringIndexable } from '../../../ReportsPage/HeatmapPage/HeatmapUtils';
import { HomepageEntity } from '../../../../api/userInsightTypes';
import {
  Scorecard,
  ScorecardLadder,
  ScorecardServiceScore,
} from '../../../../api/types';
import { ScorecardLaddersCard } from '../ScorecardLaddersCard';
import { ScorecardsTableCard } from '../ScorecardsTableCard';

interface ScoresTabProps {
  entitiesByTag: StringIndexable<HomepageEntity>;
  ladder: ScorecardLadder | undefined;
  scorecard: Scorecard;
  scores: ScorecardServiceScore[];
}

const ScoresTab = ({
  ladder,
  scorecard,
  scores,
  entitiesByTag,
}: ScoresTabProps) => {
  console.log(ladder);
  console.log(scorecard);
  console.log(scores);
  console.log(entitiesByTag);

  return (
    <>
      {ladder && <ScorecardLaddersCard ladder={ladder} />}
      <ScorecardsTableCard
        entitiesByTag={entitiesByTag}
        scorecardId={scorecard.id}
        scores={scores}
      />
    </>
  );
};

export default ScoresTab;
