/*
 * Copyright 2021 Cortex Applications Inc.
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
import React from "react";
import { ServiceScorecardScore } from "../../api/types";
import Box from "@material-ui/core/Box";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Button, TableCell, Tooltip } from "@material-ui/core";

type CortexScorecardScoresColumnProps = {
  scores: ServiceScorecardScore[] | undefined
}

export const CortexScorecardScoresColumn = ({
  scores
}: CortexScorecardScoresColumnProps) => {

  if (scores === undefined) {
    return <div>Service is not synced with Cortex</div>
  } else if (scores.length === 0) {
    return <div>No scores found for service</div>
  }

  return (
    <div>
      { scores.map((score, i) => (
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
                    <Button href={`https://app.getcortexapp.com/admin/scorecards/${score.scorecardId}`}>
                      <CircularProgressbar
                        value={score.scorePercentage * 100}
                        text={`${(score.scorePercentage * 100).toFixed(2)}%`}
                        strokeWidth={5}
                      />
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
  )
};
