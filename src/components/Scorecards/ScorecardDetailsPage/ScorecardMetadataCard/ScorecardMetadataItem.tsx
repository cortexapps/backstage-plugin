import React from "react";
import { Grid, makeStyles, Typography } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  label: {
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    fontSize: '10px',
    fontWeight: 'bold',
    letterSpacing: 0.5,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  value: {
    fontWeight: 'bold',
    overflow: 'hidden',
    lineHeight: '24px',
    wordBreak: 'break-word',
  },
}))

interface ScorecardMetadataItemProps {
  label: string;
  children: string | React.ReactNode;
  gridSizes?: Record<string, number>;
}

export const ScorecardMetadataItem = ({
  label, children, gridSizes
}: ScorecardMetadataItemProps) => {

  const classes = useStyles()

  return (
    <Grid item {...gridSizes}>
      <Typography variant="subtitle2" className={classes.label}>
        { label }
      </Typography>
      { typeof children === 'string'  ? (
          <Typography variant="body2" className={classes.value}>
            { children }
          </Typography>
      ) : (
        children
      )}
    </Grid>
  )
}
