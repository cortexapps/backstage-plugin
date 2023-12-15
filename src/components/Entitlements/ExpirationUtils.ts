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
import {ContractType, ExpirationResponse} from "../../api/types";

import {isNil} from 'lodash';
import moment from "moment/moment";

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
