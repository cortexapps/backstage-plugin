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
import React, { useMemo } from 'react';
import { Timeseries } from '../../Timeseries';
import { ScorecardResult } from '../../../api/types';
import { isRuleFailing, sortRules } from '../../../utils/ScorecardRules';
import { ScorecardsServiceTooltipRuleRow } from './ScorecardsServiceTooltipRuleRow';
import { Paper, Box, makeStyles, Typography } from '@material-ui/core';

interface ScorecardsServiceOverallScoreProgressProps {
  results: ScorecardResult[];
  scorecardId: string;
}

const useStyles = makeStyles(theme => ({
  tooltipRoot: {
    margin: theme.spacing(1),
    maxWidth: '400px',
    minWidth: '400px',
  },
}));

export const ScorecardsServiceOverallScoreProgress: React.FC<ScorecardsServiceOverallScoreProgressProps> =
  ({ results, scorecardId }) => {
    const classes = useStyles();
    const data = useMemo(() => {
      return [
        {
          data: results?.map(scorecardResult => {
            return {
              x: new Date(scorecardResult.dateCreated),
              y: (scorecardResult.possibleScore === 0
                ? 0
                : (scorecardResult.totalScore / scorecardResult.possibleScore) *
                  100
              ).toFixed(2),
            };
          }),
          id: scorecardId,
        },
      ];
    }, [results, scorecardId]);

    if (results === undefined) {
      return null;
    }

    return (
      <Timeseries
        data={data}
        tooltip={point => {
          const sortedRules = sortRules(results[point.point.index].ruleResults);

          return (
            <Paper>
              <Box
                key={`tooltip-${point.point.index}`}
                className={classes.tooltipRoot}
              >
                <Typography variant="body1">
                  {point.point.data.xFormatted}
                </Typography>
                {sortedRules
                  .filter(rule => isRuleFailing(rule))
                  .map(rule => (
                    <ScorecardsServiceTooltipRuleRow
                      key={`TooltipRuleRow-${point.point.index}-${
                        rule.id ?? rule.expression
                      }`}
                      rule={rule}
                    />
                  ))}
              </Box>
            </Paper>
          );
        }}
      />
    );
  };
