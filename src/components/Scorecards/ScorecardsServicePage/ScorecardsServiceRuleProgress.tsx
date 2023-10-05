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
import { StringIndexable } from '../../ReportsPage/HeatmapPage/HeatmapUtils';
import moment from 'moment';
import { filterByValues } from '../../../utils/ObjectUtils';
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

export function precision(val: number) {
  if (val >= 10 * 30 * 6) {
    return 'every 3 months';
  } else if (val >= 30 * 6) {
    return 'every 1 month';
  } else if (val >= 10 * 6) {
    return 'every 10 days';
  } else if (val >= 24) {
    return 'every 4 days';
  } else if (val >= 14) {
    return 'every 2 days';
  } else {
    return 'every 1 days';
  }
}

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
          ?.map(
            ({ x, y }) =>
              ({
                x: new Date(x),
                y: Number.parseFloat(y),
              } ?? []),
          )
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

/**
 * Copied from brain-app!
 * Breakdown list of ScorecardResults into the list of ApexSeries that it's made of, given our list of
 * current scorecard rules.
 *
 * To sync all of the ApexCharts, we need to have the same x-coordinates for every chart.
 * For missing data values for Rule charts, ApexCharts expects 'null' y coordinates.
 *
 * For example:
 *   const results = [5,4,3,6,8]
 * This possibly could be broken down into:
 *   const brokenDownRules = [
 *      [3,    1,    null, null, null],
 *      [2,    3,    1,    3,    null],
 *      [null, null, 2,    3,    8   ]
 *   ]
 *
 * @param currentExpressions List of existing scorecard rules. We only want to graph this set of expressions.
 * @param results List of cached scorecard results for a scorecard
 * @returns All ApexSeries for currentExpressions expressions, indexed by the expressions.
 */
export function unflattenScorecardResults(
  currentExpressions: string[],
  results: ScorecardResult[],
): StringIndexable<ApexSeries> {
  const seriesByExpression = currentExpressions.reduce(
    (datasets: StringIndexable<ApexSeries>, ruleExpression: string) => {
      datasets[ruleExpression] = {
        data: [],
        name: ruleExpression,
        target: { label: { text: '' }, y: 0 },
      };
      return datasets;
    },
    {},
  );

  results.forEach((result, idx) => {
    Object.values(seriesByExpression).forEach(series => {
      series.data[idx] = {
        x: moment.utc(result.dateCreated).local().toISOString(),
        y: null,
      };
    });

    result.ruleResults.forEach(ruleResult => {
      const series = seriesByExpression[ruleResult.expression];

      if (series !== undefined) {
        if (
          ruleResult.leftExpression !== undefined &&
          ruleResult.leftResult !== undefined &&
          Number.isFinite(ruleResult.leftResult)
        ) {
          // Handle numbers ie runbooks.count > 1
          series.name = ruleResult.leftExpression;
          series.data[idx].y = ruleResult.leftResult;
          series.target = {
            label: { text: ruleResult.rightExpression },
            y: ruleResult.rightResult,
          };
        } else {
          // Handle non-numerical results
          series.name = ruleResult.expression;
          series.data[idx].y = ruleResult.score;
          series.target = {
            label: { text: ruleResult.expression },
            y: ruleResult.score,
          };
        }
      }
    });
  });

  // Filter out empty series
  return filterByValues(seriesByExpression, apexSeries => {
    return apexSeries.data.reduce(
      (shouldTake: boolean, datum: ApexSeriesData) => {
        return shouldTake || datum.y !== null;
      },
      false,
    );
  });
}

export interface ApexSeries {
  data: ApexSeriesData[];
  name: string;
  target: { label: { text?: string }; y: number };
}

export interface ApexSeriesData {
  x: string;
  y: any;
}
