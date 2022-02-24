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
import React, { useState } from 'react';
import { ScorecardServiceScore } from '../../../../api/types';
import {
  Collapse,
  IconButton,
  makeStyles,
  TableCell,
  TableRow,
} from '@material-ui/core';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import Box from '@material-ui/core/Box';
import { ScorecardResultDetails } from './ScorecardResultDetails';
import { parseEntityRef } from '@backstage/catalog-model';
import { Gauge } from '../../../Gauge';
import LoyaltyIcon from '@material-ui/icons/Loyalty';
import { ScorecardServiceRefLink } from '../../../ScorecardServiceRefLink';

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

  const [open, setOpen] = useState(false);

  return (
    <React.Fragment>
      <TableRow className={classes.root}>
        <TableCell className={classes.openIcon}>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Box
            flexDirection="row"
            display="flex"
            justifyContent="flex-start"
            alignItems="center"
          >
            <Box alignSelf="center" width={1 / 8}>
              <Gauge
                value={score.scorePercentage}
                strokeWidth={8}
                trailWidth={8}
              />
            </Box>
            <Box alignSelf="center" flex="1">
              <ScorecardServiceRefLink
                scorecardId={scorecardId}
                componentRef={score.componentRef}
              >
                <b>
                  {
                    parseEntityRef(score.componentRef, {
                      defaultKind: 'Component',
                      defaultNamespace: 'default',
                    }).name
                  }
                </b>
              </ScorecardServiceRefLink>
            </Box>
            {currentLevel && (
              <Box display="flex" alignItems="center">
                <LoyaltyIcon style={{ color: `${currentLevel.color}` }} />
                {currentLevel.name}
              </Box>
            )}
          </Box>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <ScorecardResultDetails rules={score.rules} />
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};
