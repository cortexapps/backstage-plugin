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
import { ExpirationResponse } from "../../api/types";
import { WarningPanel } from "@backstage/core-components";
import { isNil } from "lodash";
import moment from "moment";
import { getExpirationMessage } from "./ExpirationUtils";

interface ExpirationBannerProps extends ExpirationResponse {
}

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

