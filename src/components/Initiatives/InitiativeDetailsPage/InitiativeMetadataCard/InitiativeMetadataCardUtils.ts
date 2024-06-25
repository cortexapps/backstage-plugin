/*
 * Copyright 2024 Cortex Applications, Inc.
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

import { isNil } from 'lodash';
import { Initiative } from '../../../../api/types';
import { daysUntil } from '../../../../utils/MomentUtils';
import moment from 'moment';

export const getTargetDateMessage = (initiative: Initiative) => {
  const remainingDays = daysUntil(initiative.targetDate);

  return !isNil(remainingDays) && remainingDays < 0
  ? `Expired ${moment(initiative.targetDate).local().fromNow()}`
  : `Due by ${moment(initiative.targetDate)
        .local()
        .format('MMMM Do, YYYY')}`;
};
