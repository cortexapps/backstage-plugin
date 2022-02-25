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
import { Content, ContentHeader } from '@backstage/core-components';
import React, { useMemo, useState } from 'react';
import {
  Scorecard,
  ScorecardLadder,
  ScorecardServiceScore,
} from '../../../api/types';
import { Grid } from '@material-ui/core';
import { ScorecardMetadataCard } from './ScorecardMetadataCard';
import { ScorecardRulesCard } from './ScorecardRulesCard';
import { ScorecardFilterCard } from './ScorecardFilterCard';
import { ScorecardsTableCard } from './ScorecardsTableCard';
import { Predicate } from '../../../utils/types';
import { ScorecardLaddersCard } from './ScorecardLaddersCard';

export type ScorecardServiceScoreFilter = Predicate<ScorecardServiceScore>;

interface ScorecardDetailsProps {
  scorecard: Scorecard;
  ladder: ScorecardLadder | undefined;
  scores: ScorecardServiceScore[];
}

export const ScorecardDetails = ({
  scorecard,
  ladder,
  scores,
}: ScorecardDetailsProps) => {
  // Have to store lambda of lambda for React to not eagerly invoke
  const [filter, setFilter] = useState<() => ScorecardServiceScoreFilter>(
    () => () => true,
  );

  const filteredScores = useMemo(() => {
    return scores.filter(filter);
  }, [scores, filter]);

  return (
    <Content>
      <ContentHeader title={scorecard.name} />
      <Grid container direction="row" spacing={2}>
        <Grid item lg={4}>
          <ScorecardMetadataCard scorecard={scorecard} scores={scores} />
          <ScorecardRulesCard scorecard={scorecard} />
          {ladder && <ScorecardLaddersCard ladder={ladder} />}
          <ScorecardFilterCard
            scorecard={scorecard}
            setFilter={newFilter => setFilter(() => newFilter)}
          />
        </Grid>
        <Grid item lg={8} xs={12}>
          <ScorecardsTableCard
            scorecardId={scorecard.id}
            scores={filteredScores}
          />
        </Grid>
      </Grid>
    </Content>
  );
};
