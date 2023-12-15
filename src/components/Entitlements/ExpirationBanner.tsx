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
import React from 'react';
import { ExpirationResponse} from "../../api/types";
import {WarningPanel} from "@backstage/core-components";
import {isNil} from "lodash";
import {maybePluralize} from "../../utils/strings";
import moment from "moment";

interface ExpirationBannerProps extends ExpirationResponse {}

export const ExpirationBanner = ({ contractType, expirationDate, shutdownDate }: ExpirationBannerProps) => {
  const isTrial = contractType === 'TRIAL';
  const daysUntilShutdown =
    !isNil(shutdownDate)
      ? moment(shutdownDate).diff(moment(), 'days')
      : undefined;
  const daysUntilExpiration =
    !isNil(expirationDate)
      ? moment(expirationDate).diff(moment(), 'days')
      : undefined;

  if (isNil(daysUntilExpiration)) {
    return null;
  }
  const isExpired = daysUntilExpiration < 0;

  return (
    <WarningPanel
      severity={isExpired ? 'error' : 'warning'}
      title={getExpirationMessage(isTrial, daysUntilExpiration, -daysUntilExpiration, daysUntilShutdown)}
    />
  );
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
