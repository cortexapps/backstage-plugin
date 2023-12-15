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
import moment from 'moment/moment';
import { getExpirationMessage, isBeforeShutdownDate, shouldShowExpirationBanner } from './ExpirationUtils';
import { ContractType } from '../../api/types';

describe('ExpirationUtils', () => {
  const today = moment().toISOString();
  const past = moment().add(-7, 'day').toISOString();
  const futureClose = moment().add(7, 'day').toISOString();
  const futureFar = moment().add(27, 'day').toISOString();

  describe('isBeforeShutdownDate', () => {
    const expiration = {
      expirationDate: past,
      contractType: ContractType.Trial
    };

    it('should allow access when shutdown date in future', async () => {
      const result = isBeforeShutdownDate({ ...expiration, shutdownDate: futureClose });
      expect(result).toBe(true);
    });

    it('should allow access when shutdown date today', async () => {
      const result = isBeforeShutdownDate({ ...expiration, shutdownDate: today });
      expect(result).toBe(true);
    });

    it('should allow access when shutdown date in past', async () => {
      const result = isBeforeShutdownDate({ ...expiration, shutdownDate: past });
      expect(result).toBe(false);
    });
  });

  describe('shouldShowExpirationBanner', () => {
    it('should show banner in Trial', async () => {
      const result = shouldShowExpirationBanner({
        contractType: ContractType.Trial
      });
      expect(result).toBe(true);
    });

    [
      { expirationDate: past, expected: true },
      { expirationDate: futureClose, expected: true },
      { expirationDate: futureFar, expected: false },
    ].forEach(({ expirationDate, expected }) => {
      it(`should show banner in Prod with expiration ${expirationDate}`, async () => {
        const result = shouldShowExpirationBanner({ contractType: ContractType.Production, expirationDate });
        expect(result).toBe(expected);
      });
    });
  });

  describe('getExpirationMessage', () => {
    [
      {
        isTrial: true,
        daysUntilExpiration: -10,
        daysUntilShutdown: -3,
        expected: 'Your Cortex trial has expired - Please contact your account manager to continue using Cortex!'
      },
      {
        isTrial: true,
        daysUntilExpiration: -10,
        daysUntilShutdown: 4,
        expected: 'Your Cortex trial has expired - Please contact your account manager to continue using Cortex!'
      },
      {
        isTrial: true,
        daysUntilExpiration: 0,
        daysUntilShutdown: 4,
        expected: 'Your Cortex trial expires today - Please contact your account manager to continue using Cortex!'
      },
      {
        isTrial: true,
        daysUntilExpiration: 4,
        daysUntilShutdown: 14,
        expected: 'Your Cortex trial expires in 4 days.'
      },
      {
        isTrial: false,
        daysUntilExpiration: -10,
        daysUntilShutdown: -3,
        expected: 'Your access expired 10 days ago. Your workspace will automatically shut down today. Please reach out to your account manager for support.'
      },
      {
        isTrial: false,
        daysUntilExpiration: -10,
        daysUntilShutdown: 0,
        expected: 'Your access expired 10 days ago. Your workspace will automatically shut down today. Please reach out to your account manager for support.'
      },
      {
        isTrial: false,
        daysUntilExpiration: -10,
        daysUntilShutdown: 3,
        expected: 'Your access expired 10 days ago. Your workspace will automatically shut down in 3 days. Please reach out to your account manager for support.'
      },
      {
        isTrial: false,
        daysUntilExpiration: 0,
        daysUntilShutdown: 0,
        expected: 'Your access expires today. Your workspace will automatically shut down today. Please reach out to your account manager for support.'
      },
      {
        isTrial: false,
        daysUntilExpiration: 0,
        daysUntilShutdown: 3,
        expected: 'Your access expires today. Your workspace will automatically shut down in 3 days. Please reach out to your account manager for support.'
      },
      {
        isTrial: false,
        daysUntilExpiration: 4,
        daysUntilShutdown: 13,
        expected: 'Your access is expiring in 4 days. Please reach out to your account manager for support.'
      },
    ]
      .forEach(({ isTrial, daysUntilExpiration, daysUntilShutdown, expected }) => {
        const testName = `show message for ${isTrial ? ContractType.Trial : ContractType.Production }, daysUntilExpiration=${daysUntilExpiration}, daysUntilShutdown=${daysUntilShutdown}`;
        it(testName, async () => {
          const result = getExpirationMessage(
            isTrial,
            daysUntilExpiration,
            -daysUntilExpiration,
            daysUntilShutdown
          );
          expect(result).toBe(expected);
        });
      });
  });
});
