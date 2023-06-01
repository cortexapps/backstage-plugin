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
import { ServiceScorecardScore } from '../../api/types';
import { makeStyles, TableCell, TableRow } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import { Gauge } from '../Gauge';
import { BackstageTheme } from '@backstage/theme';
import { ScorecardLadderLevelBadge } from '../Common/ScorecardLadderLevelBadge';

const useStyles = makeStyles<BackstageTheme>(theme => ({
  tableRow: {
    cursor: 'pointer',
    '&:hover': {
      background: `${theme.palette.background.default}!important`,
    },
  },
  unselected: {
    background: `${theme.palette.background.paper}!important`,
  },
  selected: {
    background: `${theme.palette.background.default}!important`,
  },
}));

interface EntityScorecardsCardRowProps {
  score: ServiceScorecardScore;
  selected: boolean;
  onSelect: () => void;
}

export const EntityScorecardsCardRow = ({
  score,
  selected,
  onSelect,
}: EntityScorecardsCardRowProps) => {
  const classes = useStyles();
  const currentLevel = score.evaluation.ladderLevels?.[0]?.currentLevel;

  return (
    <React.Fragment>
      <TableRow
        className={`${classes.tableRow} ${
          selected ? classes.selected : classes.unselected
        }`}
        onClick={onSelect}
      >
        <TableCell>
          <Box
            flexDirection="row"
            display="flex"
            justifyContent="flex-start"
            alignItems="center"
          >
            <Box alignSelf="center">
              <Gauge value={score.score.scorePercentage} />
            </Box>
            <Box alignSelf="center" flex="1">
              <b>{score.scorecard.name}</b>
            </Box>
            {currentLevel && (
              <Box display="flex" alignItems="center">
                <ScorecardLadderLevelBadge
                  name={currentLevel.name}
                  color={currentLevel.color}
                />
              </Box>
            )}
          </Box>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};
