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
import { ServiceScorecardScore } from '../../api/types';
import Box from '@material-ui/core/Box';
import { TableCell, Tooltip } from '@material-ui/core';
import { Button } from '@backstage/core-components';
import { Gauge } from "../Gauge";
import { useRouteRef } from "@backstage/core-plugin-api";
import { scorecardRouteRef } from "../../routes";

type CortexScorecardScoresColumnProps = {
  scores: ServiceScorecardScore[] | undefined;
};

export const CortexScorecardScoresColumn = ({
  scores,
}: CortexScorecardScoresColumnProps) => {

  const scorecardRef = useRouteRef(scorecardRouteRef)

  if (scores === undefined) {
    return <div>Service is not synced with Cortex</div>;
  } else if (scores.length === 0) {
    return <div>No scores found for service</div>;
  }

  return (
    <div>
      {scores.map((score, i) => (
        <TableCell padding={i === 0 ? 'none' : 'default'}>
          <div style={{ width: '100px' }}>
            <Box
              flexDirection="column"
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <Box alignSelf="center">
                <Tooltip title={score.scorecardName}>
                  <Button to={scorecardRef({ id: score.scorecardId })} color="primary">
                    <Gauge value={score.scorePercentage} strokeWidth={6} trailWidth={6}/>
                  </Button>
                </Tooltip>
              </Box>
              <Box alignSelf="center" textAlign="center">
                {score.scorecardName}
              </Box>
            </Box>
          </div>
        </TableCell>
      ))}
    </div>
  );
};
