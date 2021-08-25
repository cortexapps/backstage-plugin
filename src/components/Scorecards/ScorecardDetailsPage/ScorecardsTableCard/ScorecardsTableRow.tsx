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
import React, { useState } from "react";
import { ScorecardServiceScore } from "../../../../api/types";
import { Collapse, IconButton, makeStyles, TableCell, TableRow } from "@material-ui/core";
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { CircularProgressbar } from "react-circular-progressbar";
import Box from "@material-ui/core/Box";
import { ScorecardsTableRowDetails } from "./ScorecardsTableRowDetails";

const useStyles = makeStyles({
  root: {
    '& > *': {
      borderBottom: 'unset!important',
    },
    height: '35px',
  },
  openIcon: {
    width: '35px'
  },
  progress: {
    height: '64px',
    marginRight: '16px',
  },
})

interface ScorecardsTableRowProps {
  score: ScorecardServiceScore
}

export const ScorecardsTableRow = ({
  score
}: ScorecardsTableRowProps) => {

  const classes = useStyles()
  const [open, setOpen] = useState(false)

  return (
    <>
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
            <Box alignSelf="center">
              <CircularProgressbar
                value={score.scorePercentage * 100}
                text={`${(score.scorePercentage * 100).toFixed(0)}%`}
                strokeWidth={5}
                className={classes.progress}
                styles={{
                  text: {
                    fontSize: '24px'
                  }
                }}
              />
            </Box>
            <Box alignSelf="center">
              {/* TODO: Replace with EntityRefLink*/ }
              { score.serviceName }
            </Box>
          </Box>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <ScorecardsTableRowDetails score={score}/>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
}
