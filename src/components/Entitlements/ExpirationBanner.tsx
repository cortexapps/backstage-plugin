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
  console.debug('ExpirationBanner expiration, isTrial, daysUntilShutdown, daysUntilExpiration, isExpired :::',
    { contractType, expirationDate, shutdownDate },
    isTrial,
    daysUntilShutdown,
    daysUntilExpiration,
    isExpired);

  return <WarningPanel
    severity={isExpired ? 'error' : 'warning'}
    title={getExpirationMessage(isTrial, daysUntilExpiration, -daysUntilExpiration, daysUntilShutdown)}
  />;
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
