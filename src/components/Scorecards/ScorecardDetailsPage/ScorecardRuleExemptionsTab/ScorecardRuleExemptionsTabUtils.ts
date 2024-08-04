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

import { capitalize, isNil } from 'lodash';
import {
  ExemptionStatus,
  ExemptionStatusResponseType,
  RejectedExemptionStatus,
  RuleExemptionResponse,
} from '../../../../api/types';
import { maybePluralize } from '../../../../utils/strings';
import { daysUntil, getFormattedDate } from '../../../../utils/MomentUtils';

export const getExpiresInDays = (exemption: RuleExemptionResponse) => {
  return !isNil(exemption.endDate) ? daysUntil(exemption.endDate) : undefined;
};

export const getExpirationText = (exemption: RuleExemptionResponse) => {
  const expiresInDays = getExpiresInDays(exemption);
  return !isNil(expiresInDays)
    ? `Expires in ${maybePluralize(expiresInDays, 'day')}`
    : 'Permanent';
};

const getExemptionActionDetailsText = (
  action: string,
  user: string,
  date: string,
  capitalized: boolean = true,
) => {
  return `${capitalized ? capitalize(action) : action} ${getFormattedDate(
    date,
  )} by ${user}`;
};

export const getExemptionRequestedDetailsText = (
  exemption: RuleExemptionResponse,
) => {
  return getExemptionActionDetailsText(
    'requested',
    exemption.requestedBy,
    exemption.requestedDate,
  );
};

export const getExemptionApprovedDetailsText = (
  exemption: RuleExemptionResponse,
  capitalized: boolean = true,
) => {
  if (exemption.status.type !== ExemptionStatusResponseType.APPROVED) {
    return undefined;
  }

  return getExemptionActionDetailsText(
    'approved',
    exemption.status.approvedBy,
    exemption.status.approvedDate,
    capitalized,
  );
};

export const getExemptionRejectedDetailsText = (
  exemption: RuleExemptionResponse,
  capitalized: boolean = true,
) => {
  if (exemption.status.type !== ExemptionStatusResponseType.REJECTED) {
    return undefined;
  }

  return getExemptionActionDetailsText(
    'rejected',
    exemption.status.rejectedBy,
    exemption.status.rejectedDate,
    capitalized,
  );
};

export const getIsExpired = (exemption: RuleExemptionResponse) => {
  if (exemption.endDate === null) return false;

  const remainingDays = daysUntil(exemption.endDate);
  return !isNil(remainingDays) && remainingDays < 0;
};

export const getIsActive = (exemption: RuleExemptionResponse) => {
  return (
    !getIsExpired(exemption) &&
    exemption.status.type !== ExemptionStatusResponseType.REJECTED
  );
};

export const isRejectedStatus = (
  status: ExemptionStatus,
): status is RejectedExemptionStatus => {
  return status.type === ExemptionStatusResponseType.REJECTED;
};
