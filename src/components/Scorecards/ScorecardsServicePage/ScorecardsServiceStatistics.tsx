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
import { makeStyles, Paper, Typography } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import { RuleOutcome, ScorecardServiceScore } from '../../../api/types';
import Stats from '../../Common/Stats';
import StatsItem, { CaptionTypography } from '../../Common/StatsItem';
import { ScorecardLadderLevelBadge } from '../../Common/ScorecardLadderLevelBadge';
import { percentify } from '../../../utils/NumberUtils';
import { quantileRankSorted } from 'simple-statistics';
import { filterFailingRuleOutcomes } from '../../../utils/ScorecardRules';
import { LinearProgressWithLabel } from '../../Common/LinearProgressWithLabel';
import useLinearProgressWithLabelStyles from '../../Common/useLinearProgressWithLabelStyles';

interface ScorecardsServiceStatisticsProps {
  scores: number[];
  score: ScorecardServiceScore;
  rules: RuleOutcome[];
}

const useStyles = makeStyles(theme => ({
  levelBox: {
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(0.5),
    alignItems: 'center',
  },
}));

export const ScorecardsServiceStatistics: React.FC<ScorecardsServiceStatisticsProps> =
  ({ scores, score, rules }) => {
    const classes = useStyles();
    const currentLevel = score.ladderLevels[0]?.currentLevel;
    const rank = [...scores].reverse().indexOf(score.scorePercentage) + 1;
    const percentileRank = quantileRankSorted(scores, score.scorePercentage);
    const failingRules = filterFailingRuleOutcomes(rules).length;

    const linearProgressWithLabelClasses = useLinearProgressWithLabelStyles();

    return (
      <Paper elevation={0}>
        <Stats>
          {currentLevel && (
            <Box display="flex" flexDirection="column">
              <CaptionTypography variant="caption">Level</CaptionTypography>
              <Box className={classes.levelBox}>
                <ScorecardLadderLevelBadge
                  name={currentLevel.name}
                  color={currentLevel.color}
                />
                <Typography variant="body1">{currentLevel.name}</Typography>
              </Box>
            </Box>
          )}
          <Box>
            <CaptionTypography variant="caption">Score</CaptionTypography>
            <LinearProgressWithLabel
              classes={linearProgressWithLabelClasses}
              value={percentify(score.scorePercentage)}
            />
          </Box>
          <StatsItem caption={'Rank'} type={'NTH'} value={rank} />
          <StatsItem
            caption={'Percentile'}
            percentage
            type={'NTH'}
            value={percentileRank}
          />
          <StatsItem
            caption={'Failing rules'}
            type={'NONE'}
            value={failingRules}
          />
        </Stats>
      </Paper>
    );
  };
