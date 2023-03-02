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
import React, { useEffect, useMemo } from 'react';
import { getLookbackRange, Lookback } from '../../../utils/lookback';
import { useCortexApi, useCortexFrontendURL } from '../../../utils/hooks';
import { EmptyState, Progress, WarningPanel } from '@backstage/core-components';
import { Button, Typography } from '@material-ui/core';
import { Timeseries } from '../../Timeseries';
import Box from '@material-ui/core/Box';
import moment from 'moment';
import { mapByString } from '../../../utils/collections';
import { GroupByOption } from '../../../api/types';
import { cortexScorecardPageUrl } from '../../../utils/URLUtils';

interface AggregatedScorecardProgressProps {
  scorecardId: number;
  lookback: Lookback;
  groupBy: GroupByOption;
  filters?: string[];
  setFilterOptions: (filters: string[]) => void;
  ruleExpression?: string;
}

export const AggregatedScorecardProgress = ({
  scorecardId,
  lookback,
  groupBy,
  filters,
  setFilterOptions,
  ruleExpression,
}: AggregatedScorecardProgressProps) => {
  const {
    value: historicalScores,
    loading,
    error,
  } = useCortexApi(
    async cortexApi => {
      const [startDate, endDate] = getLookbackRange(lookback);
      return cortexApi.getAverageHistoricalScores(scorecardId, groupBy, {
        startDate,
        endDate,
        ruleExpression,
      });
    },
    [scorecardId, lookback, groupBy, ruleExpression],
  );

  const unfilteredData = useMemo(() => {
    return (
      historicalScores?.map(aggregatedResult => {
        return {
          id: aggregatedResult.identifier!!,
          data: aggregatedResult.scores.map(score => {
            return {
              x: new Date(score.dateCreated!!),
              y: (score.scorePercentage * 100).toFixed(2),
            };
          }),
        };
      }) ?? []
    );
  }, [historicalScores]);

  const data = useMemo(() => {
    return mapByString(
      unfilteredData?.filter(
        d =>
          filters === undefined ||
          filters.length === 0 ||
          filters.includes(d.id),
      ) ?? [],
      serie => serie.id,
    );
  }, [unfilteredData, filters]);

  useEffect(() => {
    setFilterOptions(unfilteredData.map(d => d.id));
  }, [setFilterOptions, unfilteredData]);

  const cortexBaseUrl = useCortexFrontendURL();

  if (loading) {
    return <Progress />;
  }

  if (error || data === undefined || historicalScores === undefined) {
    return (
      <WarningPanel severity="error" title="Could not load scores.">
        {error?.message ?? ''}
      </WarningPanel>
    );
  }

  if (Object.values(data).length === 0) {
    return (
      <EmptyState
        missing="data"
        title="Scorecard has not been evaluated yet."
        description="Wait until next scorecard evaluation, or manually trigger from within Cortex."
        action={
          <Button
            variant="contained"
            color="primary"
            href={cortexScorecardPageUrl({
              scorecardId: scorecardId,
              cortexUrl: cortexBaseUrl,
            })}
          >
            Go to Cortex
          </Button>
        }
      />
    );
  }

  return (
    <Timeseries
      data={Object.values(data)}
      tooltip={point => {
        return (
          <Box
            bgcolor="background.paper"
            border={1}
            borderRadius="borderRadius"
            borderColor="divider"
          >
            {groupBy !== GroupByOption.SERVICE && (
              <Typography>{point.point.serieId}</Typography>
            )}
            <Typography>
              {moment.utc(point.point.data.x).fromNow()}: &nbsp;
              {point.point.data.y}%
            </Typography>
          </Box>
        );
      }}
    />
  );
};
