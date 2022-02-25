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
import React, { useMemo } from 'react';
import { ScorecardServiceScore } from '../../../../api/types';
import { useDetailCardStyles } from '../../../../styles/styles';
import { Grid } from '@material-ui/core';
import { InfoCard } from '@backstage/core-components';
import { round } from 'lodash';
import { mean, medianSorted, quantileSorted } from 'simple-statistics';
import { StatsItem } from './StatsItem';

interface ScorecardStatsCardProps {
  scores: ScorecardServiceScore[];
}

export const ScorecardStatsCard = ({ scores }: ScorecardStatsCardProps) => {
  const classes = useDetailCardStyles();

  const rankedScores = useMemo(
    () => [...scores].sort((a, b) => b.score - a.score),
    [scores],
  );

  const percentages = useMemo(
    () =>
      rankedScores.length === 0
        ? [0]
        : rankedScores.map(s => s.scorePercentage),
    [rankedScores],
  );

  const avg = useMemo(() => round(mean(percentages), 2), [percentages]);
  const medianVal = useMemo(() => medianSorted(percentages), [percentages]);
  const percentile = useMemo(
    () => quantileSorted([...percentages].reverse(), 0.8),
    [percentages],
  );

  return (
    <InfoCard title="Statistics" className={classes.root}>
      <Grid container>
        <StatsItem
          value={avg}
          label={'Avg Score'}
          percentage
          gridSizes={{ xs: 3 }}
        />
        <StatsItem
          value={medianVal}
          label={'Median Score'}
          percentage
          gridSizes={{ xs: 3 }}
        />
        <StatsItem
          value={scores.length}
          label={'Services'}
          gridSizes={{ xs: 3 }}
        />
        <StatsItem
          value={percentile}
          label={'80th Percentile'}
          percentage
          gridSizes={{ xs: 3 }}
        />
      </Grid>
    </InfoCard>
  );
};
