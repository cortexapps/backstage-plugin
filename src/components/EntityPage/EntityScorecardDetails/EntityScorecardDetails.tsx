/*
 * Copyright 2022 Cortex Applications, Inc.
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
import { ServiceScorecardScore } from '../../../api/types';
import { EntityScorecardOverview } from '../EntityScorecardOverview';
import { EntityScorecardRules } from '../EntityScorecardRules';
import { useCortexApi } from '../../../utils/hooks';
import { Progress } from '@backstage/core-components';
import { ScorecardsServiceNextRules } from '../../Scorecards/ScorecardsServicePage/ScorecardsServiceNextRules';
import { AnyEntityRef } from '../../../utils/types';

interface EntityScorecardDetailsProps {
  entityRef: AnyEntityRef;
  scorecardId: number;
  score: ServiceScorecardScore;
}

export const EntityScorecardDetails = ({
  entityRef,
  scorecardId,
  score,
}: EntityScorecardDetailsProps) => {
  const { value: ladders, loading: loadingLadders } = useCortexApi(
    api => api.getScorecardLadders(scorecardId),
    [scorecardId],
  );

  // currently we only support 1 ladder per Scorecard
  const ladder = ladders?.[0];

  if (loadingLadders) {
    return <Progress />;
  }

  return (
    <>
      {ladder === undefined ? (
        <EntityScorecardOverview score={score} />
      ) : (
        <ScorecardsServiceNextRules
          scorecardId={scorecardId}
          entityRef={entityRef}
        />
      )}
      <EntityScorecardRules score={score} />
    </>
  );
};
