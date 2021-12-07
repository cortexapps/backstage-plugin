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
import React, { useCallback } from 'react';
import { Card, Divider, Grid, makeStyles, Typography } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import { BackstageTheme } from '@backstage/theme';
import {
  fallbackPalette,
  Status,
  useDetailCardStyles,
} from '../../styles/styles';
import { ordinal } from '../../utils/strings';
import { percentify } from '../../utils/numeric';

export type StatNumberType = 'NTH' | 'PERCENTAGE' | 'NONE';

const useStyles = makeStyles<BackstageTheme>(theme => ({
  okay: {
    color: theme.palette.status?.ok ?? fallbackPalette.status.ok,
    marginBottom: '1px',
  },
  warning: {
    color: theme.palette.status?.warning ?? fallbackPalette.status.warning,
    marginBottom: '1px',
  },
  error: {
    color: theme.palette.status?.error ?? fallbackPalette.status.error,
    marginBottom: '1px',
  },
  suffix: {
    'font-size': theme.typography.h3.fontSize,
  },
}));

interface Stat {
  label: string;
  status?: Status;
  value: number;
  type?: StatNumberType;
  percentage?: boolean;
}

const suffixify = ({ type, value, percentage }: Stat) => {
  const formattedValue = percentage ? percentify(value) : value;
  let suffix: string | undefined;
  switch (type) {
    case 'NTH':
      suffix = ordinal(formattedValue);
      break;
    case 'PERCENTAGE':
      suffix = '%';
      break;
    default:
      break;
  }

  return { formattedValue: formattedValue, suffix: suffix };
};

interface StatsCardProps {
  stats: Stat[];
}

export const StatsCard = ({ stats }: StatsCardProps) => {
  const cardClasses = useDetailCardStyles();
  const colorClasses = useStyles();

  const selectClassname = useCallback(
    (status?: Status) => {
      switch (status) {
        case Status.OKAY:
          return colorClasses.okay;
        case Status.WARNING:
          return colorClasses.warning;
        case Status.ERROR:
          return colorClasses.error;
        default:
          return colorClasses.okay;
      }
    },
    [colorClasses],
  );

  return (
    <Card className={cardClasses.root}>
      <Grid container direction="row" justify="space-evenly">
        {stats.map((stat, i) => {
          const { formattedValue, suffix } = suffixify(stat);
          return (
            <React.Fragment key={stat.label}>
              <Grid item>
                <Box
                  flexDirection="column"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Typography
                    variant="h1"
                    className={selectClassname(stat.status)}
                  >
                    {formattedValue}
                    <span className={colorClasses.suffix}>
                      {suffix && suffix}
                    </span>
                  </Typography>
                  <Typography variant="body2">{stat.label}</Typography>
                </Box>
              </Grid>
              {i < stats.length - 1 && (
                <Divider orientation="vertical" variant="middle" flexItem />
              )}
            </React.Fragment>
          );
        })}
      </Grid>
    </Card>
  );
};
