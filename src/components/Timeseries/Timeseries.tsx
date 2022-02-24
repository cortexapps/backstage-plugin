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
import { makeStyles, Theme, useTheme } from '@material-ui/core';
import {
  PointMouseHandler,
  PointTooltip,
  ResponsiveLineCanvas,
  Serie,
} from '@nivo/line';
import { Theme as NivoTheme } from '@nivo/core';
import { LinearScale } from '@nivo/scales';

const useStyles = makeStyles((theme: Theme) => ({
  chartRoot: {
    height: '500px',
    marginTop: '20px',
  },
  toolTip: {
    backgroundColor: 'white',
    border: `2px solid ${theme.palette.primary.main}`,
    borderRadius: theme.spacing(2),
    padding: theme.spacing(2),
    fontFamily: 'Helvetica',
    fontSize: 12,
    color: theme.palette.primary.main,
    fontWeight: 'bold',
    boxShadow: '0px 5px 15px rgba(0,0,0,0.1)',
    marginBottom: theme.spacing(2),
  },
}));

export function nivoTheme(theme: Theme): NivoTheme {
  return {
    crosshair: {
      line: {
        stroke: theme.palette.divider,
      },
    },
    background: theme.palette.background.default,
    axis: {
      ticks: {
        line: { stroke: theme.palette.divider },
        text: { fill: theme.palette.text.primary },
      },
      legend: {
        text: { fill: theme.palette.text.primary },
      },
    },
    grid: {
      line: { stroke: theme.palette.divider },
    },
    labels: {
      text: { fill: theme.palette.text.primary },
    },
  };
}

const percentageYScale: LinearScale = {
  type: 'linear',
  min: 0,
  max: 100,
};

interface TimeseriesProps {
  data: Serie[];
  tooltip?: PointTooltip;
  onClick?: PointMouseHandler;
}

export const Timeseries = ({ data, tooltip, onClick }: TimeseriesProps) => {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <div className={classes.chartRoot}>
      <ResponsiveLineCanvas
        theme={nivoTheme(theme)}
        data={data}
        curve="linear"
        enablePoints={false}
        colors={{ scheme: 'nivo' }}
        margin={{ bottom: 30, top: 30, left: 10, right: 40 }}
        tooltip={tooltip}
        isInteractive={tooltip !== undefined}
        xScale={{
          type: 'time',
          useUTC: true,
          precision: 'hour',
        }}
        xFormat="time:%m/%d/%Y"
        yScale={percentageYScale}
        yFormat={p => `${p}%`}
        axisBottom={{
          format: '%d %b',
        }}
        axisRight={{
          format: p => `${p}%`,
        }}
        onClick={onClick}
      />
    </div>
  );
};
