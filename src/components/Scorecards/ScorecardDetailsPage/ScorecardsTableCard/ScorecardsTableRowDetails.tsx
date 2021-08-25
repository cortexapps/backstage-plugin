import React from "react";
import { ruleName, ScorecardServiceScore } from "../../../../api/types";
import { Grid, List, ListItem, ListItemAvatar, ListItemText, makeStyles } from "@material-ui/core";
import ErrorIcon from '@material-ui/icons/Error';
import CheckIcon from '@material-ui/icons/Check';

const useStyles = makeStyles(styles => ({
  openIcon: {
    width: '35px'
  },
  progress: {
    height: '64px',
    marginRight: '16px',
  },
  failing: {
    backgroundColor: styles.palette.error.dark,
  },
  rule: {
    borderRadius: 8,
  },
  rules: {
    backgroundColor: styles.palette.background.paper
  },
}))

interface ScorecardsTableRowDetailsProps {
  score: ScorecardServiceScore
}

export const ScorecardsTableRowDetails = ({
  score
}: ScorecardsTableRowDetailsProps) => {

  const classes = useStyles()

  return (
    <List>
      { score.rules.map(rule => (
        <ListItem key={rule.rule.id} alignItems="flex-start">
          <ListItemAvatar>
            { rule.score > 0 ? <CheckIcon color="primary"/> : <ErrorIcon color="error"/> }
          </ListItemAvatar>
          <Grid container direction="row" justify="space-between" alignItems="center" className={classes.rule}>
            <Grid item>
              <ListItemText primary={ruleName(rule.rule)}/>
            </Grid>
            <Grid item>
              <ListItemText primary={`${rule.score}`}/>
            </Grid>
          </Grid>
        </ListItem>
      ))}
    </List>
  )
}
