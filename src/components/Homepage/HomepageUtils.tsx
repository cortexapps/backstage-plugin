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
import moment from 'moment';
import { Oncall } from '../../api/types';
import { joinWithSpecialLastJoin, maybePluralize } from '../../utils/strings';

export const getDisplayTimeUntilNextOncall = (oncallStartDate: string) => {
  const now = moment.now();

  const hoursUntilOncall = moment(oncallStartDate).diff(now, 'hours');
  const daysUntilOncall = moment(oncallStartDate).diff(now, 'days');

  return hoursUntilOncall < 18
    ? `${hoursUntilOncall} hours`
    : `${maybePluralize(daysUntilOncall, 'day')}`;
};

export const getOncallSchedulesDisplayName = (oncalls: Oncall[]) => {
  const oncallNames = oncalls?.map(oncall => oncall.name) ?? [];
  return oncallNames.length === 1
    ? oncallNames[0]
    : joinWithSpecialLastJoin(oncallNames, {
        joiner: ', ',
        lastJoiner: ', and ',
        lastJoinerWhenTwoItems: ' and ',
      });
};
