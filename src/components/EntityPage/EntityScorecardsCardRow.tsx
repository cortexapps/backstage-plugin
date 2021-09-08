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
import { ServiceScorecardScore } from "../../api/types";
import { TableCell, TableRow } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import { Gauge } from "../Gauge";
import { ScorecardRefLink } from "../ScorecardRefLink";

interface EntityScorecardsCardRowProps {
  score: ServiceScorecardScore
}

export const EntityScorecardsCardRow = ({
  score
}: EntityScorecardsCardRowProps) => {

  return (
    <React.Fragment>
      <TableRow>
        <TableCell>
          <Box
            flexDirection="row"
            display="flex"
            justifyContent="flex-start"
            alignItems="center"
          >
            <Box alignSelf="center" width={1/4}>
              <Gauge value={score.scorePercentage} strokeWidth={8} trailWidth={8}/>
            </Box>
            <Box alignSelf="center">
              <ScorecardRefLink scorecardId={score.scorecardId}>
                <b>{ score.scorecardName }</b>
              </ScorecardRefLink>
            </Box>
          </Box>
        </TableCell>
      </TableRow>
    </React.Fragment>
  )
}
