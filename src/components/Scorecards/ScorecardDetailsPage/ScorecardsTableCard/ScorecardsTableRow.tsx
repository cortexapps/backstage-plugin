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
