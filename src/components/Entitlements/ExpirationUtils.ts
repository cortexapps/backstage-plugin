import {ContractType, ExpirationResponse} from "../../api/types";

import { isNil } from 'lodash';
import moment from "moment/moment";

export const shouldShowExpirationBanner = (
  expiration?: ExpirationResponse
) => {
  // Always show banner for trial
  if (!isNil(expiration) && expiration.contractType === ContractType.Trial) {
    return false;
  }

  const daysUntilExpiration =
    !isNil(expiration?.expirationDate)
      ? moment(expiration?.expirationDate).diff(moment(), 'days')
      : undefined;

  const ret =  !isNil(daysUntilExpiration) && daysUntilExpiration < 14;

  console.debug('expiration ', expiration);

  return ret;
};

export const isBeforeShutdownDate = (
  expiration?: ExpirationResponse
) => {
  const daysUntilShutdown =
    !isNil(expiration?.shutdownDate)
      ? moment(expiration?.shutdownDate).diff(moment(), 'days')
      : undefined;
  const ret =  !daysUntilShutdown || daysUntilShutdown > 0;
  console.debug('allowAccess ', ret);
  return ret;
};
