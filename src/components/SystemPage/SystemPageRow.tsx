/*
 * Copyright 2021 Cortex Applications, Inc.
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
import { Link } from 'react-router-dom';
import {
  Box,
  Collapse,
  IconButton,
  makeStyles,
  TableCell,
  TableRow,
} from '@material-ui/core';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { useRouteRef } from '@backstage/core-plugin-api';

import { Gauge } from '../Gauge/Gauge';
import { SystemPageRowDetails } from './SystemPageRowDetails';
import { scorecardRouteRef } from '../../routes';

import { ScorecardScore, ScorecardServiceScore } from '../../api/types';

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

interface Props {
  score: ScorecardScore;
  scoresForScorecard: ScorecardServiceScore[];
}

export const SystemPageRow: React.FC<Props> = ({
  score,
  scoresForScorecard,
}) => {
  const [open, setOpen] = useState(false);
  const classes = useStyles();
  const scorecardRef = useRouteRef(scorecardRouteRef);
  const name = score?.scorecardName ?? '';
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
                value={score?.scorePercentage ?? 0}
                strokeWidth={8}
                trailWidth={8}
              />
            </Box>
            <Box alignSelf="center" flex="1">
              <Link to={scorecardRef({ id: `${score.scorecardId}` })}>
                <b>{name}</b>
              </Link>
            </Box>
          </Box>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ padding: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <SystemPageRowDetails scoresForScorecard={scoresForScorecard} />
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};
