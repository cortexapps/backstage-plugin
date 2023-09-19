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
import React, { useMemo } from 'react';
import { ScorecardServiceScore } from '../../../../api/types';
import { useDetailCardStyles } from '../../../../styles/styles';
import { Grid } from '@material-ui/core';
import { InfoCard } from '@backstage/core-components';
import { isEmpty, isNil } from 'lodash';
import { median } from 'simple-statistics';
import { StatsItem } from './StatsItem';
import { safeDivide } from '../../../../utils/NumberUtils';

export interface ScorecardLevelRule {
  description?: string;
  expression: string;
  id: string;
  levelId: string;
  title?: string;
}

export interface ScorecardLevel {
  color: string;
  description?: string;
  id: string;
  name: string;
  rank: number;
  rules: ScorecardLevelRule[];
}

export interface ScorecardLadder {
  levels: ScorecardLevel[];
  scorecardId: string;
}

interface ScorecardStatsCardProps {
  scores: ScorecardServiceScore[];
  ladder?: ScorecardLadder;
}

export const ScorecardStatsCard = ({
  scores,
  ladder,
}: ScorecardStatsCardProps) => {
  const classes = useDetailCardStyles();

  const medianLevel = useMemo(() => {
    const levelRanks = scores.map(
      score => score.ladderLevels?.[0]?.currentLevel?.rank ?? 0,
    );
    const medianLevelRank = !isEmpty(levelRanks) ? median(levelRanks) : 0;
    return ladder?.levels.find(level => level.rank === medianLevelRank);
  }, [scores, ladder]);

  const highestLevel = useMemo(() => {
    const isHighestLevel = (score: ScorecardServiceScore) =>
      isNil(score.ladderLevels?.[0]?.nextLevel);

    return safeDivide(scores.filter(isHighestLevel).length, scores.length);
  }, [scores]);

  const percentNoLevel = useMemo(() => {
    return safeDivide(
      scores.filter(score => isNil(score.ladderLevels?.[0]?.currentLevel))
        .length,
      scores.length,
    );
  }, [scores]);

  return (
    <InfoCard title="Statistics" className={classes.root}>
      <Grid container>
        <StatsItem
          value={medianLevel?.rank || 0}
          label={'Median Level'}
          gridSizes={{ xs: 3 }}
        />
        <StatsItem
          value={highestLevel}
          label={'% at highest level'}
          percentage
          gridSizes={{ xs: 3 }}
          data-testid={'Stat-Scorecard-Avg-Score'}
        />
        <StatsItem
          value={percentNoLevel}
          label={'% without level'}
          percentage
          gridSizes={{ xs: 3 }}
        />
        <StatsItem
          value={scores.length}
          label={'Services'}
          gridSizes={{ xs: 3 }}
        />
      </Grid>
    </InfoCard>
  );
};
