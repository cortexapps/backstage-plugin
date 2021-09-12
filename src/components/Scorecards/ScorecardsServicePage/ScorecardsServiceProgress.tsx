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
import React, { useMemo } from 'react';
import { EntityRef } from '@backstage/catalog-model';
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@material-ui/core';
import { useDropdown } from '../../../utils/hooks';
import { assertUnreachable, enumKeys } from '../../../utils/types';
import { useApi } from '@backstage/core-plugin-api';
import { cortexApiRef } from '../../../api';
import { useAsync } from 'react-use';
import { EmptyState, Progress, WarningPanel } from '@backstage/core-components';
import { Timeseries } from '../../Timeseries';
import moment from 'moment';
import Box from '@material-ui/core/Box';

enum Lookback {
  DAYS_7,
  WEEKS_2,
  MONTHS_1,
  MONTHS_2,
  MONTHS_3,
}

const lookbackLabels = (lookback: Lookback) => {
  // eslint-disable-next-line default-case
  switch (lookback) {
    case Lookback.DAYS_7:
      return 'Last 7 days';
    case Lookback.WEEKS_2:
      return 'Last 2 weeks';
    case Lookback.MONTHS_1:
      return 'Last 1 month';
    case Lookback.MONTHS_2:
      return 'Last 2 months';
    case Lookback.MONTHS_3:
      return 'Last 3 months';
  }

  return assertUnreachable(lookback);
};

const getLookbackRange = (timeRange: Lookback) => {
  // eslint-disable-next-line default-case
  switch (timeRange) {
    case Lookback.DAYS_7:
      return [moment().subtract('1', 'week'), moment()];
    case Lookback.WEEKS_2:
      return [moment().subtract('2', 'week'), moment()];
    case Lookback.MONTHS_1:
      return [moment().subtract('1', 'month'), moment()];
    case Lookback.MONTHS_2:
      return [moment().subtract('2', 'months'), moment()];
    case Lookback.MONTHS_3:
      return [moment().subtract('3', 'months'), moment()];
  }

  return assertUnreachable(timeRange);
};

interface ScorecardsServiceProgressProps {
  scorecardId: string;
  entityRef: EntityRef;
}

export const ScorecardsServiceProgress = ({
  scorecardId,
  entityRef,
}: ScorecardsServiceProgressProps) => {
  const cortexApi = useApi(cortexApiRef);

  const [lookback, setLookback] = useDropdown(Lookback.MONTHS_1);

  const {
    value: historicalScores,
    loading,
    error,
  } = useAsync(async () => {
    const [startDate, endDate] = getLookbackRange(lookback!!);
    return cortexApi.getHistoricalScores(
      scorecardId,
      entityRef,
      startDate,
      endDate,
    );
  }, [lookback]);

  const data = useMemo(() => {
    return historicalScores?.map(scorecardResult => {
      return {
        x: new Date(scorecardResult.dateCreated),
        y: (scorecardResult.possibleScore === 0
          ? 0
          : (scorecardResult.totalScore / scorecardResult.possibleScore) * 100
        ).toFixed(2),
      };
    });
  }, [historicalScores]);

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

  if (data.length === 0) {
    return (
      <EmptyState
        missing="data"
        title="Scorecard has not been evaluated yet."
        description="Wait until next scorecard evaluation, or manually trigger from within Cortex."
        action={
          <Button
            variant="contained"
            color="primary"
            href={`https://app.getcortexapp.com/admin/scorecards/${scorecardId}`}
          >
            Go to Cortex
          </Button>
        }
      />
    );
  }

  return (
    <>
      <FormControl>
        <InputLabel>Time Range</InputLabel>
        <Select value={lookback} onChange={setLookback}>
          {enumKeys(Lookback).map(key => (
            <MenuItem key={key} value={Lookback[key]}>
              {lookbackLabels(Lookback[key])}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {data.length > 0 && (
        <Timeseries
          data={[{ id: `${scorecardId}-${entityRef}`, data: data }]}
          tooltip={point => {
            return (
              <Box
                bgcolor="background.paper"
                border={1}
                borderRadius="borderRadius"
                borderColor="divider"
              >
                <Typography>
                  {moment
                    .utc(historicalScores[point.point.index].dateCreated)
                    .fromNow()}
                </Typography>
              </Box>
            );
          }}
        />
      )}
    </>
  );
};
