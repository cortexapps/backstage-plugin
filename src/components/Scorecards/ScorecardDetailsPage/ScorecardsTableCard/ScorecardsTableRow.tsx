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
import { ScorecardServiceScore } from '../../../../api/types';
import { makeStyles, TableCell, TableRow } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import { parseEntityRef } from '@backstage/catalog-model';
import { Gauge } from '../../../Gauge';
import { ScorecardServiceRefLink } from '../../../ScorecardServiceRefLink';
import { ScorecardLadderLevelBadge } from '../../../Common/ScorecardLadderLevelBadge';

const useStyles = makeStyles({
  root: {
    '& > *': {
      borderBottom: 'unset!important',
    },
    height: '35px',
  },
  openIcon: {
    width: '35px',
  },
  progress: {
    height: '64px',
    marginRight: '16px',
  },
});

interface ScorecardsTableRowProps {
  scorecardId: number;
  score: ScorecardServiceScore;
}

export const ScorecardsTableRow = ({
  scorecardId,
  score,
}: ScorecardsTableRowProps) => {
  const classes = useStyles();
  const currentLevel = score.ladderLevels?.[0]?.currentLevel;

  return (
    <React.Fragment>
      <TableRow className={classes.root}>
        <TableCell>
          <ScorecardServiceRefLink
            scorecardId={scorecardId}
            componentRef={score.componentRef}
          >
            <Box
              flexDirection="row"
              display="flex"
              justifyContent="flex-start"
              alignItems="center"
            >
              <Box alignSelf="center">
                <Gauge
                  value={score.scorePercentage}
                  strokeWidth={10}
                  trailWidth={10}
                />
              </Box>
              <Box alignSelf="center" flex="1">
                <b>
                  {
                    parseEntityRef(score.componentRef, {
                      defaultKind: 'Component',
                      defaultNamespace: 'default',
                    }).name
                  }
                </b>
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
          </ScorecardServiceRefLink>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};
