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
import React from 'react';
import { Box, makeStyles, Table, TableCell, TableRow } from '@material-ui/core';
import { Link } from 'react-router-dom';

import { Gauge } from '../Gauge/Gauge';

import { ScorecardServiceScore } from '../../api/types';

interface Props {
  scoresForScorecard: ScorecardServiceScore[];
}

const useStyles = makeStyles({
  root: {
    '& > *': {
      borderBottom: 'unset!important',
    },
    height: '15px',
  },
  progress: {
    height: '32px',
    marginRight: '16px',
  },
});

export const SystemPageRowDetails: React.FC<Props> = ({
  scoresForScorecard,
}) => {
  const classes = useStyles();

  return (
    <Table>
      {scoresForScorecard.map(score => (
        <TableRow className={classes.root} key={score.serviceId}>
          <TableCell>
            <Box
              flexDirection="row"
              display="flex"
              justifyContent="flex-start"
              alignItems="center"
            >
              <Box alignSelf="center" width={1 / 16}>
                <Gauge
                  value={score.scorePercentage}
                  strokeWidth={8}
                  trailWidth={8}
                />
              </Box>
              <Box alignSelf="center" flex="1">
                {score && (
                  <Link to={`/catalog/default/component/${score?.componentRef}`}>
                    {score?.componentRef}
                  </Link>
                )}
              </Box>
            </Box>
          </TableCell>
        </TableRow>
      ))}
    </Table>
  );
};
