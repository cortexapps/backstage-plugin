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
