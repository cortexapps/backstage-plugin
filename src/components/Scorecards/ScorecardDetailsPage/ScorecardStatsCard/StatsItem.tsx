/*
 * Copyright 2022 Cortex Applications, Inc.
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
import { Grid, makeStyles, Typography, useTheme } from '@material-ui/core';
import { BackstageTheme } from '@backstage/theme';
import { getProgressColor } from '../../../Gauge/Gauge';
import { percentify } from '../../../../utils/numeric';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  label: {},
  value: {},
});

interface StatsItemProps {
  value: number;
  label: string;
  percentage?: boolean;
  gridSizes?: Record<string, number>;
}

export const StatsItem = ({
  value,
  label,
  percentage = false,
  gridSizes,
}: StatsItemProps) => {
  const classes = useStyles();
  const theme = useTheme<BackstageTheme>();

  const valueToDisplay = percentage ? percentify(value) : value;
  const color = getProgressColor(theme.palette, valueToDisplay);
  const style = percentage ? { color } : {};

  return (
    <Grid item {...gridSizes} className={classes.root}>
      <Typography variant="h4" className={classes.value} style={style}>
        {valueToDisplay}
        {percentage && '%'}
      </Typography>
      <Typography variant="body2" className={classes.label}>
        {label}
      </Typography>
    </Grid>
  );
};
