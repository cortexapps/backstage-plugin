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
import { ScorecardLadder, ScorecardServiceScore } from '../../../../api/types';
import { Box, Paper, Typography, makeStyles } from '@material-ui/core';
import { isEmpty, isNil } from 'lodash';
import { median } from 'simple-statistics';
import Stats from '../../../Common/Stats';
import StatsItem, { CaptionTypography } from '../../../Common/StatsItem';
import { safeDivide } from '../../../../utils/NumberUtils';
import { ScorecardLadderLevelBadge } from '../../../Common/ScorecardLadderLevelBadge';

interface ScorecardStatsCardProps {
  scorecardLadder: ScorecardLadder;
  scores: ScorecardServiceScore[];
}

const useStyles = makeStyles(theme => ({
  levelBox: {
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(0.5),
    alignItems: 'center',
  },
}));

export const ScorecardStatsCard = ({
  scores,
  scorecardLadder,
}: ScorecardStatsCardProps) => {
  const classes = useStyles();
  const numberOfEntities = scores.length;

  const medianLevel = useMemo(() => {
    const levelRanks = scores.map(
      score => score.ladderLevels?.[0]?.currentLevel?.rank ?? 0,
    );
    const medianLevelRank = !isEmpty(levelRanks) ? median(levelRanks) : 0;
    return scorecardLadder.levels.find(level => level.rank === medianLevelRank);
  }, [scores, scorecardLadder]);

  const percentAtHighestLevel = useMemo(() => {
    return safeDivide(
      scores.filter(score => isNil(score.ladderLevels?.[0]?.nextLevel)).length,
      numberOfEntities,
    );
  }, [scores, numberOfEntities]);

  const percentNoLevel = useMemo(() => {
    return safeDivide(
      scores.filter(score => isNil(score.ladderLevels?.[0]?.currentLevel))
        .length,
      numberOfEntities,
    );
  }, [scores, numberOfEntities]);

  return (
    <Paper elevation={0} style={{ marginBottom: 8 }}>
      <Stats>
        <Box display="flex" flexDirection="column">
          <CaptionTypography variant="caption">Level</CaptionTypography>
          <Box className={classes.levelBox}>
            <ScorecardLadderLevelBadge
              name={medianLevel?.name}
              color={medianLevel?.color}
            />
            <Typography variant="body1">
              {medianLevel?.name ?? 'No Level'}
            </Typography>
          </Box>
        </Box>
        <StatsItem
          caption={'% at highest level'}
          percentage
          type={'PERCENTAGE'}
          value={percentAtHighestLevel}
        />
        <StatsItem
          caption={'% without level'}
          percentage
          type={'PERCENTAGE'}
          value={percentNoLevel}
        />
        <StatsItem
          caption={'Entities'}
          type={'NONE'}
          value={numberOfEntities}
        />
      </Stats>
    </Paper>
  );
};
