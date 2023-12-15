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
import { ContractType, ExpirationResponse } from "../../api/types";

import { isNil } from 'lodash';
import moment from "moment/moment";
import { maybePluralize } from "../../utils/strings";

export const shouldShowExpirationBanner = (
  expiration?: ExpirationResponse
) => {
  // Always show banner for trial
  if (!isNil(expiration) && expiration.contractType === ContractType.Trial) {
    return true;
  }

  const daysUntilExpiration =
    !isNil(expiration?.expirationDate)
      ? moment(expiration?.expirationDate).diff(moment(), 'days')
      : undefined;

  return !isNil(daysUntilExpiration) && daysUntilExpiration < 14;
};

export const isBeforeShutdownDate = (
  expiration?: ExpirationResponse
) => {
  const daysUntilShutdown =
    !isNil(expiration?.shutdownDate)
      ? moment(expiration?.shutdownDate).diff(moment(), 'days')
      : undefined;
  return !daysUntilShutdown || daysUntilShutdown > 0;
};

export const getExpirationMessage = (
  isTrial: boolean,
  daysUntilExpiration: number,
  daysPastExpiration?: number,
  daysUntilShutdown?: number
) => {
  return isTrial
    ? getTrialExpirationMessage(daysUntilExpiration)
    : getProdExpirationMessage(daysUntilExpiration, daysPastExpiration, daysUntilShutdown);
};

const getProdExpirationMessage = (
  daysUntilExpiration: number,
  daysPastExpiration?: number,
  daysUntilShutdown?: number
) => {
  const shutdownDates =
    !isNil(daysUntilShutdown) && daysUntilShutdown > 0
      ? `in ${maybePluralize(daysUntilShutdown, 'day')}`
      : 'today';

  const shutdownMessage =
    !isNil(daysUntilShutdown)
      ? `. Your workspace will automatically shut down ${shutdownDates}`
      : '';

  const expirationState =
    daysUntilExpiration > 0
      ? `is expiring in ${maybePluralize(daysUntilExpiration, 'day')}`
      : daysUntilExpiration === 0
        ? `expires today${shutdownMessage}`
        : `expired ${daysPastExpiration} days ago${shutdownMessage}`;

  return `Your access ${expirationState}. Please reach out to your account manager for support.`;
};

const getTrialExpirationMessage = (daysUntilExpiration: number) => {
  return daysUntilExpiration > 0
    ? `Your Cortex trial expires in ${maybePluralize(daysUntilExpiration, 'day')}.`
    : daysUntilExpiration === 0
      ? 'Your Cortex trial expires today - Please contact your account manager to continue using Cortex!'
      : 'Your Cortex trial has expired - Please contact your account manager to continue using Cortex!';
};
