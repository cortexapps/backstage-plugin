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
import { EntityRef } from '@backstage/catalog-model';

import {
  ArgumentAxis,
  Chart,
  LineSeries,
  ValueAxis,
} from '@devexpress/dx-react-chart-material-ui';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
} from '@material-ui/core';
import { useDropdown } from '../../../utils/hooks';
import { assertUnreachable, enumKeys } from '../../../utils/types';
import { useApi } from '@backstage/core-plugin-api';
import { cortexApiRef } from '../../../api';

const data = [
  { argument: 1, value: 10 },
  { argument: 2, value: 20 },
  { argument: 3, value: 30 },
];

interface ScorecardsServiceProgressProps {
  entityRef: EntityRef;
}

enum TimeRanges {
  DAYS_7,
  WEEKS_2,
  MONTHS_1,
  MONTHS_2,
  MONTHS_3,
}

const timeRangeLabels = (timeRange: TimeRanges) => {
  // eslint-disable-next-line default-case
  switch (timeRange) {
    case TimeRanges.DAYS_7:
      return 'Last 7 days';
    case TimeRanges.WEEKS_2:
      return 'Last 2 weeks';
    case TimeRanges.MONTHS_1:
      return 'Last 1 month';
    case TimeRanges.MONTHS_2:
      return 'Last 2 months';
    case TimeRanges.MONTHS_3:
      return 'Last 3 months';
  }

  return assertUnreachable(timeRange);
};

export const ScorecardsServiceProgress = ({
  entityRef,
}: ScorecardsServiceProgressProps) => {
  const cortexApi = useApi(cortexApiRef);

  const [timeRange, setTimeRange] = useDropdown(TimeRanges.MONTHS_1);
  const [selectedRule, setSelectedRule] = useDropdown<string>();

  return (
    <>
      <FormControl>
        <InputLabel>Time Range</InputLabel>
        <Select value={timeRange} onChange={setTimeRange}>
          {enumKeys(TimeRanges).map(key => (
            <MenuItem key={key} value={TimeRanges[key]}>
              {timeRangeLabels(TimeRanges[key])}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl>
        <InputLabel>By Rule</InputLabel>
        <Select value={timeRange} onChange={setTimeRange}>
          <MenuItem value={undefined}>Overall</MenuItem>
        </Select>
      </FormControl>
      <Paper>
        <Chart data={data}>
          <ArgumentAxis />
          <ValueAxis />

          <LineSeries valueField="value" argumentField="argument" />
        </Chart>
      </Paper>
    </>
  );
};
