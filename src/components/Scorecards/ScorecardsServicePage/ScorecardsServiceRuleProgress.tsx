/*
 * Copyright 2023 Cortex Applications, Inc.
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
import React, { useMemo, useRef } from 'react';
import { ScorecardResult } from '../../../api/types';
import {
  Box,
  Paper,
  Typography,
  makeStyles,
  useTheme,
} from '@material-ui/core';
import { useDimensions } from '../../../utils/pureHooks';
import { LineCanvas, PointTooltipProps } from '@nivo/line';
import { nivoTheme } from '../../Timeseries/Timeseries';
import { fallbackPalette } from '../../../styles/styles';
import {
  precision,
  unflattenScorecardResults,
} from './ScorecardsServiceRuleProgressUtils';

interface ScorecardsServiceRuleProgressProps {
  expression: string;
  results: ScorecardResult[];
  scorecardId: string;
}

const useStyles = makeStyles(theme => ({
  tooltipRoot: {
    minWidth: '140px',
    margin: theme.spacing(1),
  },
}));

export const ScorecardsServiceRuleProgress: React.FC<ScorecardsServiceRuleProgressProps> =
  ({ expression, results, scorecardId }) => {
    const apexCharts = useMemo(() => {
      return unflattenScorecardResults([expression], results);
    }, [expression, results]);

    const ref = useRef<HTMLDivElement>(null);
    const { width } = useDimensions(ref);
    const theme = useTheme();
    const classes = useStyles();
    const mapped = useMemo(
      () =>
        apexCharts?.[expression]?.data
          ?.map(({ x, y }) => ({
            x: new Date(x),
            y: Number.parseFloat(y),
          }))
          ?.filter(({ y }) => !isNaN(y)),
      [apexCharts, expression],
    );

    const seriesData = apexCharts[expression];

    if (!seriesData || seriesData.data.length === 0) {
      return <Typography>No data found for this rule.</Typography>;
    }

    return (
      <div ref={ref}>
        <LineCanvas
          axisBottom={{
            format: '%d %b',
            tickValues: precision(mapped.length),
          }}
          axisLeft={null}
          axisRight={{}}
          height={400}
          colors={fallbackPalette.common.purple[400]}
          curve={'linear'}
          data={[{ data: mapped, id: scorecardId }]}
          enablePoints={false}
          margin={{ bottom: 30, left: 10, right: 40, top: 30 }}
          markers={[
            {
              axis: 'y',
              legend: `Target: ${seriesData.target.label.text}`,
              lineStyle: {
                stroke: fallbackPalette.common.purple[300],
                strokeWidth: 2,
              },
              value: seriesData.target.y,
            },
          ]}
          theme={nivoTheme(theme)}
          tooltip={(point: PointTooltipProps) => {
            return (
              <Paper>
                <Box
                  key={`tooltip-${point.point.index}`}
                  className={classes.tooltipRoot}
                >
                  <Typography component={'div'}>
                    {point?.point?.data?.xFormatted}:{' '}
                    {point?.point?.data?.yFormatted}
                  </Typography>
                </Box>
              </Paper>
            );
          }}
          width={width > 48 ? width - 48 : 0}
          xFormat={'time:%m/%d/%Y'}
          xScale={{
            precision: 'hour',
            type: 'time',
            useUTC: true,
          }}
        />
      </div>
    );
  };
