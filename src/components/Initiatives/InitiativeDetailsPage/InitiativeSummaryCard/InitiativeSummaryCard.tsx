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
import {
  fallbackPalette,
  useDetailCardStyles,
} from '../../../../styles/styles';
import { Card, Divider, Grid, makeStyles, Typography } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import { BackstageTheme } from '@backstage/theme';

const useStyles = makeStyles<BackstageTheme>(theme => ({
  passing: {
    color: theme.palette.status?.ok ?? fallbackPalette.status.ok,
    marginBottom: '1px',
  },
  failing: {
    color: theme.palette.status?.error ?? fallbackPalette.status.error,
    marginBottom: '1px',
  },
}));

interface InitiativeSummaryCardProps {
  numPassing: number;
  numFailing: number;
}

export const InitiativeSummaryCard = ({
  numPassing,
  numFailing,
}: InitiativeSummaryCardProps) => {
  const cardClasses = useDetailCardStyles();
  const colorClasses = useStyles();

  return (
    <Card className={cardClasses.root}>
      <Grid container direction="row" justify="space-evenly">
        <Grid item>
          <Box
            flexDirection="column"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Typography variant="h1" className={colorClasses.passing}>
              {numPassing}
            </Typography>
            <Typography variant="body2">Passing</Typography>
          </Box>
        </Grid>
        <Divider orientation="vertical" variant="middle" flexItem />
        <Grid item>
          <Box
            flexDirection="column"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Typography variant="h1" className={colorClasses.failing}>
              {numFailing}
            </Typography>
            <Typography variant="body2">Failing</Typography>
          </Box>
        </Grid>
      </Grid>
    </Card>
  );
};
