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
import { parseEntityName, parseEntityRef } from '@backstage/catalog-model';
import { Gauge } from '../../../Gauge';
import { Link } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';
import { scorecardServiceDetailsRouteRef } from '../../../../routes';
import { defaultComponentRefContext } from '../../../../utils/ComponentUtils';

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
  scorecardId: string;
  score: ScorecardServiceScore;
}

export const ScorecardsTableRow = ({
  scorecardId,
  score,
}: ScorecardsTableRowProps) => {
  const classes = useStyles();
  const serviceDetailsRef = useRouteRef(scorecardServiceDetailsRouteRef);

  const entityName = parseEntityName(
    score.componentRef,
    defaultComponentRefContext,
  );

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
            <Box alignSelf="center">
              <Link
                to={serviceDetailsRef({
                  scorecardId: scorecardId,
                  ...entityName,
                })}
              >
                <b>
                  {
                    parseEntityRef(score.componentRef, {
                      defaultKind: 'Component',
                      defaultNamespace: 'default',
                    }).name
                  }
                </b>
              </Link>
            </Box>
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
