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
import { Box, makeStyles, Table, TableCell, TableRow } from '@material-ui/core';

import { Gauge } from '../Gauge/Gauge';

import { ScorecardServiceScore } from '../../api/types';
import { DefaultEntityRefLink } from '../DefaultEntityLink';
import { parseEntityRef } from '@backstage/catalog-model';
import { defaultComponentRefContext } from '../../utils/ComponentUtils';
import { ScorecardLadderLevelBadge } from '../Common/ScorecardLadderLevelBadge';

interface SystemPageRowDetailsProps {
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

export const SystemPageRowDetails: React.FC<SystemPageRowDetailsProps> = ({
  scoresForScorecard,
}) => {
  const classes = useStyles();

  return (
    <Table>
      {scoresForScorecard.map(score => {
        const currentLevel = score.ladderLevels?.[0]?.currentLevel;

        return (
          <TableRow className={classes.root} key={`TableRow${score.serviceId}`}>
            <TableCell>
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
                  {score && (
                    <DefaultEntityRefLink
                      entityRef={parseEntityRef(
                        score.componentRef,
                        defaultComponentRefContext,
                      )}
                    />
                  )}
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
        );
      })}
    </Table>
  );
};
