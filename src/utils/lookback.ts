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
import { assertUnreachable } from './types';
import moment from 'moment';

export enum Lookback {
  DAYS_7,
  WEEKS_2,
  MONTHS_1,
  MONTHS_2,
  MONTHS_3,
}

export const lookbackLabels = (lookback: Lookback) => {
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

export const getLookbackRange = (timeRange: Lookback) => {
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
